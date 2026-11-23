const fs = require("fs");
const path = require("path");

const rootDir = __dirname;
const indexPath = path.join(rootDir, "index.html");
const requiredFiles = [
  "robots.txt",
  "sitemap.xml",
  path.join("assets", "images", "qr-live-demo.png"),
];

const errors = [];

function isFile(relativePath) {
  try {
    return fs.statSync(path.join(rootDir, relativePath)).isFile();
  } catch {
    return false;
  }
}

function getAttribute(tag, attributeName) {
  const quoted = new RegExp(
    `(?:^|\\s)${attributeName}\\s*=\\s*(["'])(.*?)\\1`,
    "i",
  );
  const unquoted = new RegExp(
    `(?:^|\\s)${attributeName}\\s*=\\s*([^\\s"'<>]+)`,
    "i",
  );
  const match = tag.match(quoted) || tag.match(unquoted);
  return match ? (match[2] || match[1]).trim() : null;
}

for (const relativePath of requiredFiles) {
  if (!isFile(relativePath)) {
    errors.push(`Missing required file: ${relativePath}`);
  }
}

let indexHtml = "";
if (isFile("index.html")) {
  indexHtml = fs.readFileSync(indexPath, "utf8");

  const h1Tags = indexHtml.match(/<h1\b[^>]*>/gi) || [];
  if (h1Tags.length !== 1) {
    errors.push(`index.html must contain exactly one <h1> tag (found ${h1Tags.length})`);
  }

  const imgTags = indexHtml.match(/<img\b[^>]*>/gi) || [];
  imgTags.forEach((tag, index) => {
    if (getAttribute(tag, "alt") === null) {
      errors.push(`index.html: <img> #${index + 1} is missing the alt attribute`);
    }
  });

  const linkTags = indexHtml.match(/<link\b[^>]*>/gi) || [];
  const hasCanonical = linkTags.some((tag) => {
    const rel = getAttribute(tag, "rel");
    return rel !== null && rel.split(/\s+/).includes("canonical");
  });
  if (!hasCanonical) {
    errors.push('index.html is missing a link tag with rel="canonical"');
  }

  const metaTags = indexHtml.match(/<meta\b[^>]*>/gi) || [];
  const hasOgTitle = metaTags.some((tag) => getAttribute(tag, "property") === "og:title");
  if (!hasOgTitle) {
    errors.push('index.html is missing a meta tag with property="og:title"');
  }
} else {
  errors.push("Missing required file: index.html");
}

if (errors.length > 0) {
  console.error("LAB12 audit failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("LAB12 audit passed.");
process.exit(0);
