# ⚡ AI Image Compressor (ImageOptimizer Pro)

A professional, high-performance, **100% client-side** image compression, resizing, and conversion web application. Built with Next.js, React 19, Tailwind CSS v4, and Zustand.

---

## 🌟 Key Features

*   **🔒 100% Privacy-Focused**: All optimization and conversion tasks run entirely in your local browser. Your images **never** touch a server or external API.
*   **🎯 Smart Target Size (Binary Search)**: Enter your desired file size (e.g., 200 KB or 1.5 MB), and the application will execute a binary search algorithm to find the absolute best quality and resolution combination.
*   **⚡ High-Speed Bulk Uploads**: Upload dozens of images simultaneously. Optimization runs in parallel, providing near-instantaneous feedback.
*   **📐 Advanced Aspect-Locked Resizing**:
    *   Maintain original dimensions
    *   Scale down by percentage
    *   Target exact width/height (with optional aspect lock)
    *   Fit to maximum bounding dimensions
*   **🔄 Broad Format Conversion**: Convert and optimize between popular web formats:
    *   **WebP** (Best Compression)
    *   **JPG** (Universal Compatibility)
    *   **PNG** (Lossless & Alpha Transparency)
    *   **AVIF** (Ultra-efficient next-gen format)
    *   **BMP** & **TIFF** (Lossless/Archival formats)
*   **🎨 Custom Background Canvas Fill**: Replace alpha transparencies in PNG/WebP files with any solid custom background hex/color when converting to JPG.
*   **📦 Batch ZIP Downloads**: Download all processed images as a single, organized `.zip` file with custom naming pattern templates (e.g., `{name}-compressed-{width}x{height}`).
*   **🌙 Premium Dark UI**: Features a sleek, responsive, glassmorphic layout tailored for modern web browsers.

---

## 🛠️ Technology Stack

*   **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Components)
*   **Library**: [React 19](https://react.dev/)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (using the new CSS-first `@theme` syntax)
*   **State Management**: [Zustand](https://github.com/pmndrs/zustand)
*   **Utilities**:
    *   [JSZip](https://stuk.github.io/jszip/) (Client-side ZIP packaging)
    *   [File-Saver](https://github.com/eligrey/FileSaver.js/) (Client-side file downloads)
    *   [Lucide React](https://lucide.dev/) (Iconography)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Installation

1. Clone the repository and navigate to the project root:
    ```bash
    git clone <repository-url>
    cd image-compressor
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Start the development server:
    ```bash
    npm run dev
    ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to run the application.

---

## 🏗️ Building for Production

To build a minified, production-optimized bundle:

```bash
npm run build
```

This will run the Next.js compiler, execute TypeScript diagnostics, and bundle the client-side code into the `.next` output directory. Start the built production server using:

```bash
npm run start
```

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).
