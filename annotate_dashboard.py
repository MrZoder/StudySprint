from PIL import Image, ImageDraw, ImageFont


INPUT_PATH = "dashboard_raw.png"
OUTPUT_PATH = "dashboard_annotated.png"


def get_font(size: int):
    try:
        return ImageFont.truetype("arial.ttf", size)
    except Exception:
        return ImageFont.load_default()


def draw_callout(draw: ImageDraw.ImageDraw, text: str, box, target, color):
    x, y, w, h = box
    tx, ty = target
    radius = 10
    line_w = 3

    # Rounded rectangle
    draw.rounded_rectangle((x, y, x + w, y + h), radius=radius, fill=(15, 23, 42, 235), outline=color, width=2)

    # Connector line
    start = (x + w // 2, y + h if ty > y else y)
    draw.line((start, (tx, ty)), fill=color, width=line_w)
    draw.ellipse((tx - 4, ty - 4, tx + 4, ty + 4), fill=color)

    # Text
    font = get_font(18)
    text_color = (238, 242, 255)
    pad = 12
    max_w = w - (pad * 2)

    words = text.split()
    lines = []
    current = ""
    for word in words:
        candidate = (current + " " + word).strip()
        tw = draw.textlength(candidate, font=font)
        if tw <= max_w:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)

    line_h = 24
    ty_text = y + pad
    for line in lines:
        draw.text((x + pad, ty_text), line, fill=text_color, font=font)
        ty_text += line_h


def main():
    im = Image.open(INPUT_PATH).convert("RGBA")
    overlay = Image.new("RGBA", im.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    accent = (129, 140, 248, 255)  # indigo

    # 1 Study summary panel
    draw_callout(
        draw,
        "Study summary panel - gives users a quick overview of workload and priorities",
        box=(40, 20, 360, 110),
        target=(500, 170),
        color=accent,
    )

    # 2 Stat cards
    draw_callout(
        draw,
        "Stat cards - summarise total assignments, due this week, overdue, and completed work",
        box=(840, 20, 400, 110),
        target=(700, 280),
        color=accent,
    )

    # 3 Due Soon
    draw_callout(
        draw,
        "Due Soon section - highlights tasks that need immediate attention",
        box=(30, 360, 390, 95),
        target=(520, 420),
        color=accent,
    )

    # 4 Needs Attention
    draw_callout(
        draw,
        "Needs Attention section - shows overdue work that should be resolved first",
        box=(860, 350, 380, 100),
        target=(970, 450),
        color=accent,
    )

    # 5 Weekly Progress
    draw_callout(
        draw,
        "Weekly Progress card - helps users track study progress over time",
        box=(860, 565, 380, 95),
        target=(975, 575),
        color=accent,
    )

    # 6 Navigation sidebar
    draw_callout(
        draw,
        "Navigation sidebar - allows users to move between main areas of the app",
        box=(20, 560, 380, 95),
        target=(130, 250),
        color=accent,
    )

    out = Image.alpha_composite(im, overlay).convert("RGB")
    out.save(OUTPUT_PATH, quality=95)


if __name__ == "__main__":
    main()
