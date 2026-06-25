# Skill Tester

An offline desktop application built with **Tauri v2** and **Rust** to parse, lint, validate, simulate, and dry-run agent skill files. 

Skills are markdown files with YAML frontmatter used to feed context and playbooks to autonomous penetration testing AI agents. This utility allows developers to test matching logic, verify frontmatter schema correctness, inspect coverage, and run dry-run tests against local or cloud LLMs.

---

## Key Features

1. **Frontmatter Lint & Validate**
   - Parse YAML frontmatter of individual files or recursively traverse directory structures.
   - Enforce schema validation (e.g., required fields, valid phases, non-empty bodies).
   - **Auto-Fix** feature that utilizes edit-distance phase correction and priority coercion with a live diff preview.
   - Watch mode that automatically re-validates when files change.

2. **Trigger Matching Simulator**
   - Simulate and debug skill trigger rules (technologies, services, ports, paths, signals, phases).
   - Evaluates scenario states using OR-match evaluation criteria and displays results sorted by priority.
   - Highlights warnings for scenarios matching zero skills or matching too many skills.

3. **Coverage Matrix**
   - **Phase Coverage**: Visual progress mapping across the 9 cyber kill-chain phases.
   - **Tool Coverage**: Matches 87 built-in agent tools against skill inventory to find gaps.
   - **OWASP Top 10 Mapping**: Maps skills to vulnerability classes, warning you when gaps (such as A06 or A09) lack playbooks.

4. **LLM Dry-Run Tester**
   - Select cloud or local LLM providers: **OpenAI**, **Anthropic**, **Ollama**, **LM Studio**, and **AnythingLLM**.
   - Input custom target scenarios and render the model's recommended actions in real-time.
   - Supports selecting response language (English or Thai) and rating LLM suggestions.

---

## Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript, Tailwind CSS v4, and `marked.js` (markdown renderer).
- **Backend**: Rust, Tauri v2 framework, Tokio (async runtime), Serde (serialization), Reqwest (HTTP client), and Walkdir (file parsing).

---

## Getting Started

### Prerequisites

- **Node.js** (v18+)
- **Rust & Cargo** (v1.75+)

### Installation & Setup

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone https://github.com/NonBytes/skills-validation.git
   cd skills-validation
   ```

2. Install Node dependencies (required for Tailwind CSS build CLI):
   ```bash
   npm install
   ```

### Running in Development Mode

To launch the desktop application with hot-reload and Tailwind compilation:

1. Compile the CSS:
   ```bash
   npm run build:css
   ```
   *(For continuous development, you can run `npm run dev:css` in a separate terminal to watch style changes)*

2. Start the Tauri application:
   ```bash
   cargo tauri dev
   ```

---

## Production Build Guide

To build the standalone production executable for your operating system, follow the platform-specific instructions below:

### 🍏 macOS Build

#### Prerequisites
- **Xcode Command Line Tools**: Install by running:
  ```bash
  xcode-select --install
  ```

#### Build Command
```bash
npm run build:css
cargo tauri build
```
The output bundles will be generated in:
- **`.dmg` Installer**: `src-tauri/target/release/bundle/dmg/`
- **`.app` Application Bundle**: `src-tauri/target/release/bundle/macos/`

---

### 🐧 Linux Build (Debian/Ubuntu)

#### Prerequisites
Install the required system packages, including compilers, OpenSSL, GTK, and WebKit2GTK:
```bash
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  libgtk-3-dev \
  libappindicator3-dev \
  librsvg2-dev
```

#### Build Command
```bash
npm run build:css
cargo tauri build
```
The output bundles will be generated in:
- **`.deb` Installer**: `src-tauri/target/release/bundle/deb/`
- **`.AppImage` Executable**: `src-tauri/target/release/bundle/appimage/`

---

###  Windows Build

#### Prerequisites
1. **Visual Studio Build Tools**: Install C++ Build Tools (via Visual Studio Installer).
2. **WiX Toolset**: Required to bundle the application as an `.msi` installer.
   - Install the WiX Toolset v3 or v4 (you can use `winget install WiXToolset.WiXToolsets` or download it from their website).

#### Build Command
```cmd
npm run build:css
cargo tauri build
```
The output bundles will be generated in:
- **`.msi` Installer**: `src-tauri\target\release\bundle\msi\`
- **`.exe` Installer (NSIS)**: `src-tauri\target\release\bundle\nsis\` (if configured)

---

## Download

Pre-built binaries are available on the [Releases](https://github.com/NonBytes/skills-validation/releases) page:

| Platform | File |
|---|---|
| macOS (Apple Silicon) | `Skills.Validation_x.x.x_aarch64.dmg` |
| macOS (Intel) | `Skills.Validation_x.x.x_x64.dmg` |
| Linux | `Skills.Validation_x.x.x_amd64.deb` or `.AppImage` |
| Windows | `Skills.Validation_x.x.x_x64-setup.exe` or `.msi` |

### macOS: "App is damaged" warning

The app is not signed with an Apple Developer certificate, so macOS Gatekeeper will block it. To fix this, run the following command after installing:

```bash
xattr -cr "/Applications/Skills Validation.app"
```

Or if you opened the `.dmg` but haven't moved it to Applications yet:

```bash
xattr -cr ~/Downloads/Skills\ Validation.app
```

Then open the app normally.

---

## Running Tests

The Rust backend includes unit tests to verify trigger matching, directory traversal, auto-fixing edit distances, and LLM configuration parsing. Run the test suite using:

```bash
cargo test
```
