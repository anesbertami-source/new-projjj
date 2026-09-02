import pypdf
import os
import sys

def get_pdf_page_count(filepath):
    """Get the number of pages in a PDF file."""
    try:
        with open(filepath, 'rb') as file:
            pdf_reader = pypdf.PdfReader(file)
            return len(pdf_reader.pages)
    except Exception as e:
        return f"Error: {str(e)}"

def check_pdfs():
    """Check page counts for all test PDFs."""
    test_files = [
        'output/test-short-content.pdf',
        'output/test-medium-content.pdf',
        'output/test-long-content.pdf',
        'output/test-very-long-content.pdf'
    ]
    
    print("📊 PDF Pagination Test Results")
    print("=" * 70)
    
    results = []
    for filepath in test_files:
        full_path = os.path.join('c:/Users/anesb/Documents/new-projjj', filepath)
        if os.path.exists(full_path):
            page_count = get_pdf_page_count(full_path)
            filename = os.path.basename(filepath)
            results.append({
                'file': filename,
                'path': filepath,
                'pages': page_count
            })
            print(f"\n📄 {filename}")
            print(f"   Pages: {page_count}")
        else:
            print(f"\n❌ {filepath} - File not found")
    
    print("\n" + "=" * 70)
    print("\n✅ PAGINATION TEST RESULTS:")
    print("-" * 70)
    
    for result in results:
        pages = result['pages']
        if isinstance(pages, int):
            status = "✓" if pages >= 2 else "✗"
            print(f"{status} {result['file']:30s} → {pages} page(s)")
    
    print("\n" + "=" * 70)
    print("\n🎯 ANALYSIS:")
    print("-" * 70)
    
    # Check if pagination is working
    pages_list = [r['pages'] for r in results if isinstance(r['pages'], int)]
    if pages_list:
        if all(p >= 2 for p in pages_list):
            if pages_list[-1] > pages_list[0]:
                print("✅ PAGINATION IS WORKING!")
                print(f"   • Short content: {pages_list[0]} page(s)")
                print(f"   • Very long content: {pages_list[-1]} page(s)")
                print(f"   • Page count increase: {pages_list[-1] - pages_list[0]} additional page(s)")
                print("\n✨ SUCCESS: PDF page count automatically increases with content!")
                return True
            else:
                print("⚠️  Page counts are not increasing with content length")
                print("   This may indicate pagination is not working correctly")
                return False
        else:
            print("⚠️  Some PDFs have fewer than 2 pages")
            return False
    else:
        print("❌ Could not determine page counts")
        return False

if __name__ == '__main__':
    os.chdir('c:/Users/anesb/Documents/new-projjj')
    success = check_pdfs()
    sys.exit(0 if success else 1)
