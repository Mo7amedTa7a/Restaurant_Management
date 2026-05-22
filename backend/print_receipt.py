import sys
import json
import arabic_reshaper
from bidi.algorithm import get_display
from escpos.printer import Win32Raw
from PIL import Image, ImageDraw, ImageFont
import os

def render_receipt(data, width=512):
    # Estimate height (will expand)

    estimated_height = 2000
    image = Image.new('RGB', (width, estimated_height), color='white')
    draw = ImageDraw.Draw(image)
    
    # Load Fonts
    font_path = r"C:\Windows\Fonts\arial.ttf"
    try:
        font_large = ImageFont.truetype(font_path, 40)
        font_medium = ImageFont.truetype(font_path, 30)
        font_small = ImageFont.truetype(font_path, 24)
        font_bold = ImageFont.truetype(font_path, 32)
    except:
        font_large = font_medium = font_small = font_bold = ImageFont.load_default()

    y = 20
    
    def draw_text_centered(text, font, y_pos):
        reshaped = arabic_reshaper.reshape(text)
        bidi_text = get_display(reshaped)
        bbox = draw.textbbox((0, 0), bidi_text, font=font)
        w = bbox[2] - bbox[0]
        draw.text(((width - w) / 2, y_pos), bidi_text, font=font, fill='black')
        return bbox[3] - bbox[1] + 10

    def draw_text_rtl(text, font, y_pos, x_margin=20):
        reshaped = arabic_reshaper.reshape(text)
        bidi_text = get_display(reshaped)
        bbox = draw.textbbox((0, 0), bidi_text, font=font)
        w = bbox[2] - bbox[0]
        draw.text((width - w - x_margin, y_pos), bidi_text, font=font, fill='black')
        return bbox[3] - bbox[1] + 10

    def draw_column(text, font, y_pos, x_pos, align="right"):
        reshaped = arabic_reshaper.reshape(text)
        bidi_text = get_display(reshaped)
        bbox = draw.textbbox((0, 0), bidi_text, font=font)
        w = bbox[2] - bbox[0]
        if align == "right":
            draw.text((x_pos - w, y_pos), bidi_text, font=font, fill='black')
        elif align == "left":
            draw.text((x_pos, y_pos), bidi_text, font=font, fill='black')
        else: # center
            draw.text((x_pos - (w/2), y_pos), bidi_text, font=font, fill='black')

    def draw_line(y_pos):
        draw.line([(20, y_pos), (width - 20, y_pos)], fill='black', width=2)
        return 15

    # Header
    y += draw_text_centered("FOMO (Fast Food)", font_large, y)
    y += draw_text_centered("فرع اسيوط الجديدة", font_medium, y)
    y += draw_text_centered("ت: 01030442397", font_medium, y)
    y += draw_line(y)
    
    # Order Info
    y += draw_text_rtl(f"رقم الطلب: #ORD-{data.get('id', '???')}", font_small, y)
    y += draw_text_rtl(f"التاريخ: {data.get('date', '')}", font_small, y)
    y += draw_text_rtl(f"الكاشير: {data.get('cashier', 'admin')}", font_small, y)
    
    # Customer Info
    if data.get('customer_name'):
        y += draw_text_rtl(f"العميل: {data.get('customer_name')}", font_small, y)
    if data.get('customer_phone'):
        y += draw_text_rtl(f"ت: {data.get('customer_phone')}", font_small, y)
        
    y += draw_line(y)
    
    # Items Table Header
    # Column positions
    col_item = width - 20
    col_qty = width / 2 + 20
    col_total = 20
    
    draw_column("الصنف", font_bold, y, col_item, "right")
    draw_column("الكمية", font_bold, y, col_qty, "center")
    draw_column("الاجمالي", font_bold, y, col_total, "left")
    y += 40
    y += draw_line(y)
    
    # Items
    for item in data.get('items', []):
        name = item.get('name', 'منتج')
        qty = str(item.get('quantity', 0))
        total = item.get('price', 0) * item.get('quantity', 0)
        price_str = f"{total:.1f}"
        
        row_y = y
        draw_column(name, font_small, row_y, col_item, "right")
        draw_column(qty, font_small, row_y, col_qty, "center")
        draw_column(price_str, font_small, row_y, col_total, "left")
        
        # Calculate height for next row (handle potential multiline name if needed, but for now simple)
        y += 35
        
    y += draw_line(y)
    
    # Total
    total_val = data.get('total_amount', 0)
    total_text = f"الإجمالي: {total_val:.1f} ج.م"
    y += draw_text_rtl(total_text, font_large, y)

    
    y += draw_line(y)
    y += draw_text_centered("شكراً لزيارتكم!", font_medium, y)
    y += draw_text_centered("Powered by FOMO Tech", font_small, y)
    
    # Crop Image to actual height
    final_image = image.crop((0, 0, width, y + 60))
    # Convert to 1-bit black and white for thermal printers
    final_image = final_image.convert('1')
    return final_image

def main():
    try:
        # Force UTF-8 for stdin on Windows
        import io
        sys.stdin = io.TextIOWrapper(sys.stdin.buffer, encoding='utf-8')
        
        # Read JSON from stdin
        input_data = sys.stdin.read()
        if not input_data:
            return
        
        data = json.loads(input_data)

        
        # Detect Printer
        import win32print
        printer_name = win32print.GetDefaultPrinter()
        
        # Adjust width based on name
        if "58" in printer_name:
            width = 384
        else:
            width = 512
            
        # Render
        img = render_receipt(data, width=width)
        
        # Print
        p = Win32Raw(printer_name)
        
        # Use bitImageRaster for better compatibility with Chinese/Generic printers
        p.image(img, impl='bitImageRaster')
        p.cut()
        
        sys.stdout.write(f"SUCCESS: Printed to {printer_name}")
    except Exception as e:
        sys.stderr.write(f"ERROR: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
