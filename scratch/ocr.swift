import Foundation
import Vision
import AppKit

guard CommandLine.arguments.count > 1 else {
    print("Usage: ocr <image-path>")
    exit(1)
}

let imagePath = CommandLine.arguments[1]
let imageUrl = URL(fileURLWithPath: imagePath)

guard let image = NSImage(contentsOf: imageUrl),
      let tiffData = image.tiffRepresentation,
      let cgImageSource = CGImageSourceCreateWithData(tiffData as CFData, nil),
      let cgImage = CGImageSourceCreateImageAtIndex(cgImageSource, 0, nil) else {
    print("Failed to load image at \(imagePath)")
    exit(1)
}

let requestHandler = VNImageRequestHandler(cgImage: cgImage, options: [:])
let request = VNRecognizeTextRequest { (request, error) in
    if let error = error {
        print("Error: \(error.localizedDescription)")
        return
    }
    
    guard let observations = request.results as? [VNRecognizedTextObservation] else { return }
    
    for observation in observations {
        guard let candidate = observation.topCandidates(1).first else { continue }
        print(candidate.string)
    }
}

request.recognitionLevel = .accurate
request.usesLanguageCorrection = true

do {
    try requestHandler.perform([request])
} catch {
    print("Failed to perform request: \(error.localizedDescription)")
    exit(1)
}
