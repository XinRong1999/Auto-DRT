# Auto DRT Analyzer

A simple, browser-based tool for EIS fitting, DRT analysis, peak extraction, and paper-ready figure export.

## Short Description

Auto DRT Analyzer is a lightweight local tool for working with electrochemical impedance spectroscopy (EIS) data. It helps users import EIS files, visualize Nyquist and Bode plots, perform simple automatic equivalent-circuit fitting, calculate and display DRT distributions, detect DRT peaks, compare multiple projects, and export publication-quality figures and Excel results.

The software is designed for users who want a fast and practical workflow from EIS data to DRT visualization, peak information, fitting parameters, and paper-ready figures. It is intentionally simple to operate and is not intended to be a complicated DRT parameter-tuning platform.

## Usage

Browser version

This tool can run directly in a web browser.

1. Download or clone this repository.
2. Open index.html with a modern browser such as Chrome, Edge, or Safari.
3. Import your EIS data and start the analysis.

No Python environment or additional installation is required for the browser version.

## Desktop version

A packaged desktop application is currently available only for macOS.

For macOS users, open Auto DRT Analyzer.app.
If macOS blocks the app on the first launch, right-click the app and select Open.

Windows and Linux desktop versions are not available at this stage. Users on these systems should use the browser version by opening index.html.

## Key Highlights

- One-click EIS loading and analysis.
- Automatic DRT calculation with simple lambda control.
- Simple equivalent-circuit fitting for common EIS models.
- Editable equivalent circuit builder with common elements such as R, CPE, C, W, and R || CPE.
- DRT peak detection with manual peak addition and removal.
- Editable DRT peak names.
- Area-normalized impedance support, including `Ω cm²`.
- Axis label customization for journal-style figures.
- Multi-project overlay comparison for EIS and DRT.
- Independent project colors, markers, and legends.
- Paper-ready PDF figure export.
- Excel export including EIS data.

## What Can You Use It For?

Auto DRT Analyzer can be used to:

- quickly inspect EIS spectra;
- compare different samples, temperatures, atmospheres, or processing conditions;
- generate Nyquist, Bode magnitude, and Bode phase plots;
- estimate equivalent-circuit fitting parameters;
- visualize DRT distributions;
- identify high-, middle-, and low-frequency DRT peaks;
- calculate DRT peak positions and relative intensities;
- export clean figures for papers, theses, reports, and presentations;
- organize EIS, DRT, fitting, peak, and area-analysis results in Excel format.

The tool is useful for many impedance spectroscopy workflows, including studies of SOFCs, batteries, fuel cells, electrolyzers, sensors, corrosion systems, and other electrochemical or dielectric materials.

## Main Features

### EIS Visualization

The `EIS` tab displays:

- Nyquist plot;
- Bode magnitude plot;
- Bode phase plot;
- measured data points;
- fitted curves;
- fitting quality summary;
- equivalent circuit text and diagram;
- fitting parameter table.

Axes can be customized by double-clicking the x-axis or y-axis. The axis settings dialog supports auto range, manual minimum and maximum values, and common scientific axis-label styles. Nyquist axes use a default auto range starting from 0.

### DRT Analysis

The `DRT` tab displays the calculated DRT curve and related DRT outputs. The DRT x-axis can be shown as frequency or relaxation time:

- `Frequency / Hz`
- `f / Hz`
- `τ / s`
- `Relaxation time / s`

The DRT y-axis label can be selected from common journal-style expressions, including area-normalized forms such as `γ(f) / Ω cm²`.

Lambda controls DRT regularization. A smaller lambda may produce sharper but noisier peaks, while a larger lambda produces smoother DRT curves. The software provides `Auto` and `Manual` lambda modes, plus analysis modes such as `Balanced`, `Fit priority`, and `DRT smooth`.

### Fitting

Auto DRT Analyzer supports simple equivalent-circuit fitting and displays fitted parameters in the `Fitting parameters` table. The default circuit is:

```text
Rs - (R1 || CPE1) - (R2 || CPE2)
```

The `Refit` button updates the fitting curve and fitting parameters after circuit changes. The `Fix Rohm / Rs` option can be used when a known ohmic resistance should be held fixed during fitting.

### Diagnostics

The `Diagnostics` tab provides supporting information such as residual plots, run log messages, fitting status, and current model information. Use this tab to check whether the fitting result is updated, whether a circuit model is implemented, and whether the analysis settings are reasonable.

### Peak Analysis

DRT peaks can be detected automatically or edited manually. The peak table records project name, peak name, peak number, frequency, relaxation time, relative intensity, suggested process, and peak source.

## Quick Start

### Installation and Running

Auto DRT Analyzer runs locally in a browser. Open the local application or launch the packaged app, then use `Open` to load EIS data.

On macOS, double-click `Auto DRT Analyzer.app` to launch the bundled local analyzer with the app icon. You can also open `index.html` directly in a browser. The app runs entirely in the browser and does not upload data.

No Python, pip, conda, or external DRT package installation is required for the current browser-based version.

### First Run

1. Open the application.
2. Click `Open` and select an EIS data file.
3. Click `Analyze`.
4. Check the Nyquist, Bode magnitude, and Bode phase plots in the `EIS` tab.
5. Open the `DRT` tab to view the DRT curve.
6. Click `Detect DRT peaks` if peak information is needed.
7. Use each figure's `Save` button to export a paper-ready PDF. Use `Export DRT Data` for the displayed DRT x-y curve, or `Export Fit Data` for the displayed EIS fit x-y curves.

If you want to test the software first, click `Sample` to load a synthetic two-arc EIS dataset.

## Local Use

Auto DRT Analyzer is designed to run locally after installation:

- open the packaged `Auto DRT Analyzer.app` on macOS; or
- open `index.html` directly in a modern browser.

The current app does not require Python, MATLAB, Jupyter, a backend server, or a separate DRT environment. EIS parsing, fitting, DRT calculation, peak handling, figure export, and Excel export are implemented with local JavaScript and browser APIs.

The app is intended to work offline after the local files are available. When distributing the packaged app, keep `index.html`, `styles.css`, `app.js`, and `README.md` together in the application resources.

## Basic Workflow

### Step 1: Load Data

Click `Open` and choose your EIS data file. CSV, TXT, and DAT-style files are supported when they contain frequency, real impedance, and imaginary impedance columns. The software automatically handles common `Zimag` and `-Zimag` conventions.

### Step 2: Analyze

Click `Analyze`. The software will process the data, generate EIS plots, perform fitting, and calculate DRT.

### Step 3: Inspect EIS Plots

Use the `EIS` tab to inspect:

- Nyquist plot;
- Bode magnitude plot;
- Bode phase plot;
- equivalent circuit;
- fitting parameters;
- fitting quality.

### Step 4: Inspect DRT

Open the `DRT` tab to view the DRT curve. Use `Detect DRT peaks` to identify major DRT peaks, or add and edit peaks manually.

### Step 5: Export

Use the `Save` button on each figure to export a paper-ready figure. Use `Export DRT Data` to export the current DRT x-y display data, or `Export Fit Data` to export the current EIS fitted x-y display data.

You can also open the `Diagnostics` tab to inspect residuals and run messages before exporting final figures or tables.

## EIS Fitting Workflow

Auto DRT Analyzer supports simple equivalent-circuit fitting. The default circuit is:

```text
Rs - (R1 || CPE1) - (R2 || CPE2)
```

The fitted parameters are shown in the `Fitting parameters` table. Typical parameters include:

- Rs / Rohm;
- R1;
- CPE1-Q;
- CPE1-n;
- R2;
- CPE2-Q;
- CPE2-n;
- Rtotal;
- Rpol.

If you modify the equivalent circuit, click `Refit` to update the fitting curve and fitting parameters based on the current circuit model.

If you want to fix the ohmic resistance, enable `Fix Rohm / Rs` and enter the desired value. The fitting will then keep Rs fixed.

Changing the circuit model marks the fitting result as outdated until `Refit` is performed. This prevents an old fit curve from being mistaken for the result of a newly selected circuit.

## DRT Analysis Workflow

After clicking `Analyze`, the DRT curve is displayed in the `DRT` tab.

The DRT x-axis can be displayed as:

- `Frequency / Hz`
- `f / Hz`
- `τ / s`
- `Relaxation time / s`

The relation between frequency and relaxation time is:

```text
τ = 1 / (2πf)
```

Lambda controls DRT regularization. A smaller lambda may produce sharper but noisier peaks, while a larger lambda produces smoother DRT curves. The software provides:

- `Auto` lambda;
- `Manual` lambda;
- `Balanced` mode;
- `Fit priority` mode;
- `DRT smooth` mode.

For general use, `Auto` lambda and `Balanced` mode are recommended as a starting point.

## DRT Peak Detection and Manual Peak Editing

Click `Detect DRT peaks` to automatically identify visible DRT peaks. The peak table includes:

- Project name;
- Peak name;
- Peak number;
- Frequency / Hz;
- `τ / s`;
- Relative intensity;
- Suggested process;
- Source: Auto or Manual.

### Add a Peak Manually

Right-click on the DRT curve and choose `Add DRT peak here`. The software snaps the peak to the nearest DRT curve point and adds it to the peak table.

### Remove a Peak

Right-click near an existing peak and choose `Remove this peak`.

### Rename a Peak

Double-click a peak marker and enter a new peak name. You can also edit the peak name directly in the peak table.

Peak process assignments are suggestions only. They are based on approximate frequency ranges and should be interpreted together with the system, material, temperature, atmosphere, gas conditions, and literature.

## Area Normalization

The software supports area-normalized impedance using `Ω cm²`.

To use area normalization:

1. Double-click the relevant axis.
2. Select a label containing `Ω cm²`, such as `Z' / Ω cm²`, `|Z| / Ω cm²`, or `γ(f) / Ω cm²`.
3. Enter the electrode area in cm².
4. Click `Apply`.

The software calculates:

```text
Z_ASR = Z_raw × electrode area
```

If the electrode area is left empty while an `Ω cm²` label is selected, the software uses area = 1 by default. Area normalization can be applied to EIS plots and to the DRT y-axis display when an area-normalized DRT label is selected.

## Axis and Figure Customization

Double-click an axis to open the axis settings dialog. You can adjust:

- axis label;
- unit;
- auto range;
- minimum value;
- maximum value;
- reverse y-axis for Bode phase;
- frequency or `τ` display for DRT.

For Nyquist and Bode magnitude plots, common labels include:

- `Z' / Ω`
- `Zre / Ω`
- `Re(Z) / Ω`
- `-Z'' / Ω`
- `-Zim / Ω`
- `-Im(Z) / Ω`
- `|Z| / Ω`
- `|Z| / Ω cm²`

For Bode phase, labels include:

- `Phase / deg.`
- `θ / °`
- `Phase angle / °`
- `-Phase / deg.`
- `-θ / °`
- `-Phase angle / °`

`Project preferences` allow you to change:

- project name;
- project color;
- fit color;
- peak color;
- point shape;
- point size;
- label size;
- data visibility;
- fit visibility;
- DRT visibility;
- peak visibility;
- peak sensitivity.

Figure export uses the current axis range, labels, colors, marker style, point size, label size, and legend positions.

## Multi-Project Comparison

Auto DRT Analyzer supports overlaying multiple projects for comparison. Clicking `Open` after a project is already loaded adds a new project instead of replacing the existing one.

You can compare:

- Nyquist plots;
- Bode magnitude plots;
- Bode phase plots;
- DRT curves;
- DRT peaks.

Each project can have its own:

- name;
- color;
- fit color;
- marker shape;
- point size;
- visible data, fit, DRT curve, and peaks.

The project selector controls which project is active for editing and summary display. Changing the active project updates `Project preferences`, DRT summary, peak tables, and related settings for that project.

Each project has its own independent legend. Legends can be moved separately in each plot, and their positions are remembered. When multiple projects are shown, exported figures include all visible projects.

## Exporting Paper-Ready Figures

Each figure has its own `Save` button. Supported figure export includes:

- Nyquist plot;
- Bode magnitude plot;
- Bode phase plot;
- DRT plot;
- equivalent circuit diagram;
- diagnostic plots, if available.

The default export format is PDF. Current PDF export uses a high-resolution rendered figure inside the PDF, while SVG export is available when a true vector figure is needed. PDF exports are cropped to the figure area and are suitable for papers, theses, reports, and presentations.

The exported figure uses the current axis range, labels, colors, point size, label size, and legend positions.

## Excel Export

Click `Export DRT Data` to export only the currently displayed DRT x-y curve data. The workbook contains one sheet, `DRT_XY_Data`, with `Project name`, `X label`, `X value`, `Y label`, and `Y value`.

Click `Export Fit Data` to export only the currently displayed EIS fitted curve data. The workbook contains one sheet, `Fit_XY_Data`, with `Project name`, `Plot type`, `X label`, `X value`, `Y label`, and `Y value`.

For multi-project comparisons, the same sheets include one project name per row so compared projects stay separated after export.

## Equivalent Circuit Builder

The circuit builder allows users to construct simple equivalent circuits from common EIS elements. Supported element options may include:

- R;
- C;
- CPE;
- W;
- R || C;
- R || CPE;
- R || W;
- CPE || W;
- R || CPE || W.

The total circuit is treated as a series combination beginning with Rs.

### Add an Element

1. Select an element type.
2. Click `Add element`.
3. The circuit text, circuit diagram, and parameter table will update.

### Delete an Element

1. Select an element from the series element list.
2. Click `Delete selected`.
3. Rs cannot be deleted.

### Reset the Circuit

Click `Reset default` to return to:

```text
Rs - (R1 || CPE1) - (R2 || CPE2)
```

The equivalent circuit is displayed both as text and as a simple diagram. The diagram can be saved separately as a PDF or SVG if needed.

## Recommended Use Cases

Auto DRT Analyzer is useful for:

- quick EIS inspection;
- comparing two or more electrochemical samples;
- checking temperature-dependent impedance behavior;
- comparing atmosphere, gas composition, or operating-condition effects;
- extracting approximate DRT peak positions;
- preparing paper figures;
- exporting organized DRT and fitting results;
- teaching or demonstrating EIS and DRT concepts.

## Notes and Limitations

- DRT peak assignment is not automatic physical proof. Suggested processes should be interpreted with electrochemical knowledge and literature.
- Equivalent-circuit fitting results depend on the selected circuit model.
- Overly complex circuits may lead to unstable fitting.
- Lambda selection affects DRT peak shape and peak number.
- DRT results depend on frequency range, noise, inductive artifacts, preprocessing choices, and regularization settings.
- For publication, users should report key analysis settings such as lambda mode, frequency range, circuit model, area normalization, and peak detection method.
- The software helps with analysis and visualization, but final electrochemical interpretation remains the user's responsibility.

## Security and Privacy

Auto DRT Analyzer is designed as a local-first application. EIS files are processed locally on the user's computer. The app does not intentionally upload user data to external servers, and the current source does not include remote scripts, analytics, tracking code, or CDN dependencies.

For best reproducibility and privacy, distribute the packaged app with all required local files bundled. Users should still review any downloaded release package before use, especially if it was obtained from an unofficial source.

## Dependencies and Licenses

The current browser-based version does not bundle third-party JavaScript libraries.

| Component | Purpose | Source / bundling | License status |
| --- | --- | --- | --- |
| Browser DOM, SVG, Canvas, Blob, File, localStorage APIs | UI, local file import, plotting, export, preferences | Native browser APIs | Browser/platform APIs; no bundled library license |
| Custom JavaScript in `app.js` | EIS parsing, fitting, DRT calculation, plotting, export | Project source, bundled locally | Project license needs manual confirmation |
| Custom CSS in `styles.css` | Application layout and visual styling | Project source, bundled locally | Project license needs manual confirmation |
| Generated icon assets | macOS app icon | Generated from project icon script/assets | Project license needs manual confirmation |
| `tools/make-icon.mjs` | Optional icon generation helper | Project source; not required to run the app | Project license needs manual confirmation |

No copied logos, paid fonts, external images, minified vendor files, or remote CDN dependencies were found during the current review. If future third-party libraries are added, their licenses should be listed here before release.

## Troubleshooting


