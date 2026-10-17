from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, features
import json

W, H = 1080, 1920
BG = (14, 17, 20, 255)
PANEL = (20, 24, 29, 245)
WHITE = (244, 244, 242, 255)
MUTED = (178, 181, 184, 255)
GOLD = (226, 176, 62, 255)
GOLD_SOFT = (117, 92, 38, 255)

ROOT = Path(__file__).resolve().parent
DATA = json.loads((ROOT / 'tactic_match.json').read_text(encoding='utf-8'))
OUT = Path('/tmp/tactic-thmanyah')
OUT.mkdir(parents=True, exist_ok=True)
FONT_ROOT = Path('/tmp/thmanyah')


def pick_font(*needles):
    needles = [n.lower().replace('-', '').replace('_', '') for n in needles]
    files = []
    for p in list(FONT_ROOT.rglob('*.otf')) + list(FONT_ROOT.rglob('*.ttf')):
        if '__MACOSX' in p.parts or p.name.startswith('._'):
            continue
        files.append(p)
    for p in files:
        key = p.name.lower().replace('-', '').replace('_', '')
        if all(n in key for n in needles):
            return str(p)
    raise FileNotFoundError(f'No font matching {needles}. Available: {[p.name for p in files]}')

DISPLAY_BLACK = pick_font('serifdisplay', 'black')
DISPLAY_BOLD = pick_font('serifdisplay', 'bold')
SANS_BOLD = pick_font('sans', 'bold')
SANS_MEDIUM = pick_font('sans', 'medium')
SANS_REGULAR = pick_font('sans', 'regular')

if not features.check('raqm'):
    raise RuntimeError('Pillow RAQM support is required for correct Arabic shaping.')


def font(path, size):
    return ImageFont.truetype(path, size=size)


def rounded(draw, box, radius=28, fill=PANEL, outline=None, width=2):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def text(draw, xy, value, fnt, fill=WHITE, anchor='mm', direction='rtl', stroke_width=0, stroke_fill=None):
    kwargs = dict(fill=fill, font=fnt, anchor=anchor, direction=direction, language='ar')
    if stroke_width:
        kwargs.update(stroke_width=stroke_width, stroke_fill=stroke_fill or BG)
    draw.text(xy, value, **kwargs)


def base(border=False):
    im = Image.new('RGBA', (W, H), BG)
    d = ImageDraw.Draw(im)
    for x in range(-500, 1600, 220):
        d.line([(x, 0), (x + 420, H)], fill=(28, 32, 37, 120), width=2)
    if border:
        rounded(d, (16, 16, W-16, H-16), radius=36, fill=(0,0,0,0), outline=GOLD, width=3)
    return im, d


def save(im, name):
    im.convert('RGBA').save(OUT / name)


def render_intro():
    im, d = base(border=True)
    text(d, (W//2, 170), DATA['competition']['name_ar'], font(SANS_MEDIUM, 54), GOLD)
    text(d, (W//2, 365), DATA['match']['home']['name_ar'], font(DISPLAY_BLACK, 104), WHITE)
    text(d, (W//2, 520), '0 - 2', font(SANS_BOLD, 126), GOLD, direction='ltr')
    text(d, (W//2, 675), DATA['match']['away']['name_ar'], font(DISPLAY_BLACK, 104), WHITE)
    text(d, (W//2, 885), 'ملخص المباراة', font(DISPLAY_BOLD, 82), WHITE)
    d.line((200, 970, 880, 970), fill=GOLD, width=4)
    text(d, (W//2, 1090), '16 أكتوبر 2026', font(SANS_MEDIUM, 46), MUTED)
    text(d, (W//2, 1165), 'استاد بني ياس', font(SANS_MEDIUM, 44), MUTED)
    text(d, (W//2, 1615), 'TACTIC SPORT', font(SANS_BOLD, 44), WHITE, direction='ltr')
    text(d, (W//2, 1685), 'ملخص بصري للمباراة', font(SANS_REGULAR, 34), GOLD)
    save(im, 'intro.png')


def render_goal_overlay(goal, idx):
    im = Image.new('RGBA', (W, H), (0,0,0,0))
    d = ImageDraw.Draw(im)
    rounded(d, (58, 76, 1022, 210), radius=32, fill=(12,15,18,220), outline=(226,176,62,190), width=2)
    text(d, (W//2, 143), 'بني ياس 0 - 2 الوصل', font(SANS_BOLD, 47), WHITE)
    rounded(d, (54, 1395, 1026, 1748), radius=36, fill=(10,13,16,235), outline=GOLD_SOFT, width=2)
    minute = goal.get('display_minute') or str(goal['minute'])
    text(d, (930, 1483), f"{minute}'", font(SANS_BOLD, 66), GOLD)
    text(d, (820, 1575), goal['scorer_ar'], font(DISPLAY_BOLD, 74), WHITE, anchor='rm')
    text(d, (820, 1655), 'هدف الوصل', font(SANS_MEDIUM, 39), MUTED, anchor='rm')
    if goal.get('assist_ar'):
        text(d, (820, 1710), f"صناعة: {goal['assist_ar']}", font(SANS_REGULAR, 31), MUTED, anchor='rm')
    text(d, (96, 1655), f'{idx}/2', font(SANS_BOLD, 34), GOLD, anchor='lm', direction='ltr')
    save(im, f'goal{idx}_overlay.png')


def render_stats():
    im, d = base(border=False)
    text(d, (W//2, 175), 'أرقام المباراة', font(DISPLAY_BLACK, 88), WHITE)
    text(d, (W//2, 270), 'بني ياس   |   الوصل', font(SANS_MEDIUM, 40), MUTED)
    d.line((150, 330, 930, 330), fill=GOLD, width=4)

    stats = [
        ('الاستحواذ', '46%', '54%', 46, 54),
        ('الأهداف المتوقعة xG', '1.57', '2.57', 1.57, 2.57),
        ('التسديدات', '19', '13', 19, 13),
        ('على المرمى', '4', '6', 4, 6),
        ('الفرص الكبيرة', '1', '2', 1, 2),
    ]
    y = 430
    for label, left, right, lv, rv in stats:
        rounded(d, (84, y, 996, y+220), radius=30, fill=(20,24,29,230), outline=(65,68,72,180), width=2)
        text(d, (W//2, y+54), label, font(SANS_BOLD, 42), WHITE)
        text(d, (150, y+126), left, font(SANS_BOLD, 54), WHITE, anchor='lm', direction='ltr')
        text(d, (930, y+126), right, font(SANS_BOLD, 54), GOLD, anchor='rm', direction='ltr')
        total = max(float(lv)+float(rv), 1)
        x0, x1 = 150, 930
        mid = 540
        bar_y = y + 176
        d.rounded_rectangle((x0, bar_y, mid-12, bar_y+18), 9, fill=(70,73,78,255))
        d.rounded_rectangle((mid+12, bar_y, x1, bar_y+18), 9, fill=(70,73,78,255))
        left_w = int((mid-12-x0) * float(lv)/total * 2)
        right_w = int((x1-(mid+12)) * float(rv)/total * 2)
        left_w = min(left_w, mid-12-x0)
        right_w = min(right_w, x1-(mid+12))
        if left_w > 0:
            d.rounded_rectangle((mid-12-left_w, bar_y, mid-12, bar_y+18), 9, fill=(220,220,218,255))
        if right_w > 0:
            d.rounded_rectangle((mid+12, bar_y, mid+12+right_w, bar_y+18), 9, fill=GOLD)
        y += 255
    text(d, (W//2, 1760), 'المصدر: بيانات المباراة', font(SANS_REGULAR, 30), MUTED)
    save(im, 'stats.png')


def render_motm():
    p = DATA['man_of_the_match']
    im, d = base(border=True)
    text(d, (W//2, 165), 'نجم المباراة', font(DISPLAY_BLACK, 92), GOLD)
    text(d, (W//2, 360), p['name_ar'], font(DISPLAY_BLACK, 92), WHITE)
    text(d, (W//2, 455), p['team_ar'], font(SANS_MEDIUM, 46), MUTED)
    rounded(d, (365, 560, 715, 790), radius=42, fill=(22,26,31,245), outline=GOLD, width=3)
    text(d, (W//2, 635), 'التقييم', font(SANS_MEDIUM, 36), MUTED)
    text(d, (W//2, 720), str(p['rating']), font(SANS_BOLD, 84), GOLD, direction='ltr')

    cards = [
        ('الأهداف', str(p['goals'])),
        ('التمريرات المفتاحية', str(p['key_passes'])),
        ('دقة التمرير', f"{p['pass_accuracy_pct']}%"),
        ('اللمسات', str(p['touches'])),
    ]
    positions = [(86,900,514,1110),(566,900,994,1110),(86,1160,514,1370),(566,1160,994,1370)]
    for (label,val), box in zip(cards, positions):
        rounded(d, box, radius=30, fill=(20,24,29,235), outline=(68,70,74,190), width=2)
        cx=(box[0]+box[2])//2
        text(d, (cx, box[1]+70), label, font(SANS_MEDIUM, 35), MUTED)
        text(d, (cx, box[1]+145), val, font(SANS_BOLD, 60), WHITE, direction='ltr')
    text(d, (W//2, 1580), 'هدف في شباك بني ياس', font(SANS_BOLD, 48), WHITE)
    save(im, 'motm.png')


def render_outro():
    im, d = base(border=False)
    text(d, (W//2, 420), 'نهاية المباراة', font(DISPLAY_BLACK, 90), WHITE)
    text(d, (W//2, 640), 'بني ياس 0 - 2 الوصل', font(DISPLAY_BOLD, 86), GOLD)
    d.line((230, 735, 850, 735), fill=GOLD, width=4)
    text(d, (W//2, 930), 'الوصل يحسم المواجهة', font(DISPLAY_BOLD, 70), WHITE)
    text(d, (W//2, 1030), 'بهدفي مهدي طارمي وكاميرون بويرتاس', font(SANS_MEDIUM, 38), MUTED)
    text(d, (W//2, 1510), 'TACTIC SPORT', font(SANS_BOLD, 48), WHITE, direction='ltr')
    text(d, (W//2, 1585), 'كرة القدم بالأرقام والصورة', font(SANS_REGULAR, 34), GOLD)
    save(im, 'outro.png')


render_intro()
for i, g in enumerate(DATA['goals'], 1):
    render_goal_overlay(g, i)
render_stats()
render_motm()
render_outro()
print('Rendered:', sorted(p.name for p in OUT.glob('*.png')))
print('Fonts used:', DISPLAY_BLACK, DISPLAY_BOLD, SANS_BOLD, SANS_MEDIUM, SANS_REGULAR)
