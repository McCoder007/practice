import PDFKit
import Foundation
let url = URL(fileURLWithPath: CommandLine.arguments[1])
let outDir = CommandLine.arguments[2]
guard let doc = PDFDocument(url: url) else { print("cannot open"); exit(1) }
var lines: [String] = []
for i in 0..<doc.pageCount {
  let p = doc.page(at: i)!
  let t = p.string ?? ""
  let rec: [String: Any] = ["pdfPage": i + 1, "label": p.label ?? "", "text": t]
  let d = try! JSONSerialization.data(withJSONObject: rec)
  lines.append(String(data: d, encoding: .utf8)!)
  try! t.write(toFile: outDir + "/p\(String(format: "%03d", i + 1)).txt", atomically: true, encoding: .utf8)
}
try! lines.joined(separator: "\n").write(toFile: outDir + "/pages.jsonl", atomically: true, encoding: .utf8)
print("done", doc.pageCount)
