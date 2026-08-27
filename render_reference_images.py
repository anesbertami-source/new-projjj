import os
import fitz

pdf_path = r"pdfs/01_annonce  _ DELIRIUM (1).pdf"
out_dir = r"output"
os.makedirs(out_dir, exist_ok=True)

doc = fitz.open(pdf_path)
print(f"pages={doc.page_count}")
for i, page in enumerate(doc, start=1):
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
    target = os.path.join(out_dir, f"reference-page-{i}.png")
    pix.save(target)
    print(f"saved {target} {pix.width}x{pix.height}")
