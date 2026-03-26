/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const pdf = require("pdf-parse");

const files = [
  {
    path: "books/The Elements of Statistical Learning.pdf",
    keywords: ["Support Vector Machines", "Random Forest"],
  },
  {
    path: "books/Deep Learning.pdf",
    keywords: [
      "Multilayer Perceptron",
      "Neural Networks",
      "Forward Propagation",
    ],
  },
];

async function extract() {
  for (const file of files) {
    console.log("\n--- Extracting from " + file.path + " ---");
    let dataBuffer = fs.readFileSync(file.path);
    try {
      const parser = new pdf.PDFParse({ data: dataBuffer });
      const data = await parser.getText();
      const text = data.text;

      for (const keyword of file.keywords) {
        const index = text.indexOf(keyword);
        if (index !== -1) {
          console.log("\nKeyword found: '" + keyword + "'");
          console.log(text.substring(index, index + 3000));
        } else {
          console.log("\nKeyword NOT found: '" + keyword + "'");
        }
      }
    } catch (err) {
      console.error("Error reading PDF:", err.message);
    }
  }
}

extract();
