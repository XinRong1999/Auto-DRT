# Auto DRT Analyzer

Auto DRT Analyzer is a local, browser-based application for electrochemical impedance spectroscopy (EIS) visualization, equivalent-circuit fitting, distribution of relaxation times (DRT) analysis, peak inspection, multi-project comparison, and publication-ready export.

Version: 1.0.2

Author: Xin Rong (X. Rong)

License: GNU Affero General Public License v3.0

DOI: [10.5281/zenodo.20756983](https://doi.org/10.5281/zenodo.20756983)

All analysis runs locally in the browser. Imported EIS data are not uploaded. Python, a separate DRT environment, and an internet connection are not required for normal use.

## Main Features

- Import TXT, CSV, DAT, and DTA text data.
- Paste a complete table from Excel, Origin, or another program.
- Enter Frequency, Zreal, and Zimag rows manually.
- Preview and manually correct Frequency, Zreal, and Zimag column mapping.
- Interpret either Im(Z) or -Im(Z) input and normalize the sign once during import.
- Plot Nyquist, Bode magnitude, and Bode phase data.
- Fit complex EIS data once with the selected equivalent circuit.
- Derive Nyquist and both Bode fit curves from the same fitted complex impedance.
- Calculate DRT with a non-negative regularized solver and second-difference Tikhonov regularization.
- Select automatic or manual λ, DRT grid size, calculation frequency range, and tau padding.
- Detect, display, rename, add, and remove DRT peaks.
- Display peak numbers on the DRT graph when Show DRT peaks is enabled.
- Inspect detailed DRT input, solver, residual, and gamma diagnostics.
- Compare multiple EIS and DRT projects on shared axes.
- Use project-specific colors, fit colors, point styles, point sizes, and visibility settings.
- Drag each project legend independently on each chart.
- Export DRT data and fitted EIS data as XLSX workbooks.
- Save individual figures as PDF, SVG, or PNG.
- Use English, Japanese, or Chinese interface text.

## Supported Platforms

| Platform | Release form | Status |
|---|---|---|
| macOS | Auto DRT Analyzer.app or browser HTML | Supported |
| Windows 10/11 | Self-contained Start_Auto_DRT_Analyzer_Windows.html | Supported as a portable browser application |
| Linux | Standard browser HTML | Core browser functionality is expected to work, but Linux is not a release validation target |

The Windows release is not an EXE installer. It is a self-contained HTML file containing the current CSS and JavaScript. Opening it does not start CMD, PowerShell, Terminal, or a background service.

## Quick Start

### macOS

1. Open the auto-drt-analyzer folder.
2. Double-click Auto DRT Analyzer.app.
3. If Gatekeeper blocks the unsigned local app, right-click it and choose Open.
4. Alternatively, open Start_Auto_DRT_Analyzer.html in Chrome, Edge, or Safari.

The macOS launcher opens the bundled local HTML file with the default browser and then exits. It does not keep a Terminal process running.

### Windows

1. Extract the downloaded archive to a normal folder such as Documents or Desktop.
2. Open the extracted auto-drt-analyzer folder.
3. Double-click Start_Auto_DRT_Analyzer_Windows.html.
4. Use a current version of Microsoft Edge or Google Chrome.

The Windows file is self-contained, so it does not depend on relative CSS or JavaScript paths. Extracting the archive is still recommended because some archive viewers open files through temporary folders and can interfere with file selection or browser storage.

### Browser Version

Open Start_Auto_DRT_Analyzer.html while app.js and styles.css remain in the same folder.

## Supported Data Input

### File Formats

- TXT
- CSV
- DAT
- DTA text exports
- Tables copied from Excel, Origin, or other software
- Manual row-by-row entry

Native XLSX files are not imported directly. Copy the relevant columns from Excel and use Paste or Enter Data.

### Required Columns

Each dataset must contain:

- Frequency in Hz
- Zreal, Re(Z), Z', or Zre
- Zimag, Im(Z), Z'', Zim, -Zimag, or -Im(Z)

Frequency must be greater than zero. Zreal and the imaginary column must be finite numbers.

Common delimiters are supported:

- Tab
- Comma
- Semicolon
- Spaces, including multiple consecutive spaces

UTF-8, UTF-8 BOM, UTF-16LE, and UTF-16BE are detected directly. Shift-JIS and Windows-1252 are attempted as fallback encodings for instrument text exports. CRLF and LF line endings are supported.

## Import and Sign Convention

Every file, pasted table, and manually entered table uses the same processing path:

1. Parse rows and columns.
2. Score candidate columns using headers, numeric range, sign, uniqueness, and frequency trend.
3. Show the detected Frequency, Zreal, and Zimag mapping.
4. Let the user correct the mapping and choose Im(Z) or -Im(Z).
5. Reject invalid rows, non-positive frequencies, NaN, Infinity, and duplicate frequencies.
6. Sort valid points from high frequency to low frequency while preserving row correspondence.
7. Store the internal values as Frequency, Zreal, Im(Z), and -Im(Z).

The sign conversion occurs once in the import mapping step:

- If the file contains Im(Z), usually negative for a capacitive spectrum, it is stored directly as Im(Z).
- If the file contains -Im(Z), usually positive, the software converts it to internal Im(Z).
- Nyquist, Bode, EIS fitting, and DRT all use the same normalized internal data.

Always inspect the import preview. If confidence is low, manually select the three columns before confirming the import.

## Basic Workflow

1. Select Open or Paste or Enter Data.
2. Confirm Frequency, Zreal, Zimag, and the imaginary sign convention.
3. Edit the project name if needed.
4. Open Advanced settings when calculation parameters need adjustment.
5. Select Analyze.
6. Inspect EIS, DRT, and Diagnostics.
7. Detect DRT peaks if peak markers and labels are needed.
8. Export XLSX data or save individual figures.

Opening another file adds a new project instead of replacing existing projects. Select a project in Loaded projects to edit its settings or remove it.

## EIS Plots

### Nyquist

The Nyquist graph displays Z' against -Z''. Data markers and the equivalent-circuit fit can be shown or hidden per project.

### Bode Magnitude

The Bode magnitude graph displays |Z| against frequency on logarithmic frequency scaling.

### Bode Phase

The Bode phase graph displays the phase calculated from the same complex impedance points. Axis labels include normal phase and negative-phase forms. Selecting a negative-phase label changes only the displayed sign; it does not modify the stored EIS data.

### Axis Settings

Double-click an x-axis or y-axis to open its settings. Depending on the chart, the dialog supports:

- Axis expression or unit
- Automatic or manual range
- Minimum and maximum values
- Frequency or tau display for DRT
- Normal or negative phase labels for Bode phase
- Ω or Ω cm² display for impedance-related axes

Axis settings are shared by overlaid projects so that multi-project comparisons use one coherent coordinate system.

## Equivalent-Circuit Fitting

Auto DRT Analyzer performs one optimization against the complex EIS spectrum. The residual vector contains Zreal and -Zimag contributions from the same measured frequencies.

The fitted parameter set is then used to calculate one theoretical complex impedance Z(ω). That same fitted Z(ω) is used for:

- Nyquist fit
- Bode magnitude fit
- Bode phase fit

Bode data are not fitted independently. This prevents Nyquist and Bode graphs from reporting inconsistent parameter sets.

The circuit panel supports common series blocks containing R, C, CPE, W, and supported parallel combinations. The default circuit is:

    Rs - (R1 || CPE1) - (R2 || CPE2)

Changing the circuit marks the existing fit as outdated and clears the old fit curve. Select Refit to optimize the current circuit. The circuit diagram, parameter table, residuals, diagnostics, and exported fit data then use the updated model.

Implemented component expressions include:

    ZR = R
    ZC = 1 / (jωC)
    ZCPE = 1 / (Q(jω)^n)
    ZW = A / sqrt(jω)

The Warburg implementation is a simple semi-infinite form. Treat W-containing fits as model-dependent and validate them independently.

## DRT Analysis

The DRT system combines real and imaginary EIS information. For each selected frequency, the program constructs the real and imaginary kernel rows using ω = 2πf and a logarithmically spaced tau grid.

The solver applies:

- Non-negative projected optimization
- Second-difference Tikhonov regularization
- Manual λ or automatic λ selection
- Automatic L-curve selection in Balanced mode
- Alternative fit-priority and smooth-priority scoring modes

If the non-negative solver fails, the diagnostic record identifies any fallback solver. Invalid or non-finite gamma arrays now produce an explicit error and are never silently replaced by an all-zero result.

### Calculation Frequency Range

The minimum and maximum calculation frequencies determine which measured EIS points participate in DRT inversion. They are not display limits.

Changing the calculation range:

- Filters the EIS points used to build the DRT kernel.
- Updates the effective frequency range in the DRT summary.
- Changes the observable tau range.
- Recalculates gamma, fitted impedance, peaks, and region areas after Analyze is selected.

At least five valid EIS points must remain inside the selected range.

### DRT Grid and Tau Padding

DRT points controls the number of logarithmically spaced tau grid points. Tau padding extends the inversion grid beyond the directly observable tau range.

More grid points improve numerical resolution but do not create new experimental information. Excessive padding or a very fine grid can increase ill-conditioning and edge artifacts.

### λ

λ controls regularization strength:

- Larger λ produces a smoother DRT and may merge nearby peaks.
- Smaller λ allows sharper structure but may amplify noise and edge artifacts.
- Manual λ accepts decimal and scientific notation from 1e-6 to 1.
- Automatic mode evaluates a range of λ values and selects according to the analysis mode.

For publication, report the selected λ, grid size, calculation frequency range, tau padding, sign convention, and any area normalization.

### DRT Peaks

Select Detect DRT peaks to update automatic peak detection and enable peak display. When Show DRT peaks is checked, peak markers and Peak 1, Peak 2, and subsequent labels appear on the DRT graph.

The peak table records project name, peak number, source, frequency, tau, gamma, relative intensity, and a suggested process category. Suggested processes are heuristic labels and are not material identification.

### DRT Area Analysis

Frequency regions can be defined in Advanced settings. DRT area is calculated separately for every project and reported in frequency space even when the graph uses tau on the x-axis.

## DRT Diagnostics

The DRT Diagnostics dialog reports:

- Raw, valid, and selected point counts
- Frequency, Zreal, Im(Z), and -Im(Z) ranges
- Duplicate and invalid frequency information
- Input sign convention and internal sign
- Impedance unit and electrode area state
- λ, tau range, grid size, and kernel dimensions
- Solver name, convergence state, iterations, residual, and roughness
- Gamma minimum, maximum, nonzero count, NaN count, and Infinity count
- The first solver input points
- A λ sensitivity probe at 1e-2, 1e-3, 1e-4, and 1e-5

If analysis fails, the original EIS data remain visible and the run log gives the failure reason. The program does not silently return an empty or all-zero gamma array for invalid input or non-finite solver output.

## Area Normalization and Units

Raw impedance is treated as Ω. Selecting an axis label containing Ω cm² enables area-specific display for that project. If no valid area is entered, the display uses a documented default area of 1 cm².

The conversion is:

    ZASR = Zraw × electrode area

Therefore, for the same measured impedance, a larger electrode area gives a larger numerical value in Ω cm². This is the standard area-specific resistance conversion; it is not division by area.

Area scaling is applied to display values, fitting parameter units, DRT values when an area-based DRT label is selected, and exports. Raw imported EIS values are retained internally and are not destructively overwritten.

Do not apply area normalization again if the imported values are already reported in Ω cm².

## Multi-Project Comparison

Open multiple files to overlay projects on Nyquist, Bode magnitude, Bode phase, and DRT graphs.

Each project stores its own:

- Project name
- Source file name
- Raw EIS data
- Calculated DRT data
- Detected peaks
- Circuit and fitting result
- Data, fit, and peak colors
- Point shape and size
- Data, fit, DRT, and peak visibility
- DRT area results

Axes are global and shared across visible projects. Legends are stored per chart and per project, so moving one project legend does not move another project or another chart legend.

## Export

### Data

- Export DRT Data creates an XLSX workbook containing project identity and DRT x-y data.
- Export Fit Data creates an XLSX workbook containing measured and fitted EIS-derived data.
- Multi-project exports include project names and original source names.
- Full calculated DRT data are retained for export.

### Figures

Each chart has its own Save button:

- Nyquist
- Bode magnitude
- Bode phase
- DRT
- Relative residual
- Equivalent circuit

Available formats:

- PDF, default
- SVG
- PNG

SVG is the preferred true-vector format. PDF uses a high-resolution rendered figure placed in a tightly cropped PDF. Exported charts preserve current project visibility and independent legend positions.

## Development

The release application has no runtime package dependency. Node.js is required only for repository checks and portable build generation.

Requirements:

- Node.js 18 or newer
- npm, included with Node.js

No npm install step is required because the test and build tools use only Node.js built-in modules.

Run all checks from the repository root:

    npm run check

Run individual tasks:

    npm run lint
    npm test
    npm run build:check

Synchronize both platform releases:

    npm run build

Update only the macOS application resources:

    npm run build:macos

Generate the Windows self-contained HTML:

    npm run build:windows

The build script uses Node.js path APIs and does not hard-code macOS or Windows user paths.

## Repository Layout

    README.md
    LICENSE.txt
    NOTICE
    CITATION.cff
    package.json
    auto-drt-analyzer/
      app.js
      styles.css
      Start_Auto_DRT_Analyzer.html
      Start_Auto_DRT_Analyzer_Windows.html
      Auto DRT Analyzer.app/
      tests/
      tools/

The source app.js, styles.css, and Start_Auto_DRT_Analyzer.html files are authoritative. The build script copies them into the macOS app and embeds them into the Windows standalone HTML.

## Automated Tests

The Node test suite covers:

- Standard three-column imports
- Headerless data
- Tab, comma, space, and semicolon delimiters
- Negative Im(Z) and positive -Im(Z)
- Ascending and descending frequency order
- Duplicate frequencies
- NaN values and blank lines
- CRLF text
- UTF-8 BOM
- UTF-16LE and UTF-16BE
- Single-RC nonzero DRT and peak detection
- Double-RC nonzero DRT and multiple peak detection
- Explicit failure for invalid zero-imaginary input
- One complex-EIS fitting call per analysis
- Bode curves derived from the same fitted complex impedance
- Windows temporary ZIP path detection
- Source, macOS bundle, and Windows standalone synchronization

## FAQ

### Why was the TXT column mapping wrong?

Instrument exports use many header styles and may include index, time, |Z|, or phase columns. Check the import preview and manually select Frequency, Zreal, and Zimag when confidence is low.

### How do I manually specify Frequency, Zreal, and Zimag?

After opening or pasting data, use the three mapping selectors in the import preview. Then select whether the imaginary column is Im(Z) or -Im(Z) and confirm the import.

### Should I select Im(Z) or -Im(Z)?

Select the quantity actually stored in the file. A capacitive Im(Z) column is usually negative. A -Im(Z) column is usually positive. The preview shows both the input value and normalized internal Im(Z).

### Why is the Nyquist graph upside down?

The imaginary format was probably selected incorrectly. Re-import the data and switch between Im(Z) and -Im(Z). Do not manually negate the file and also select -Im(Z).

### Why is DRT entirely zero?

Open DRT Diagnostics and check the column mapping, imaginary sign, selected calculation frequency range, λ, tau grid, solver state, and gamma statistics. Near-zero imaginary data, wrong sign, too few selected points, or unsuitable regularization can suppress the result. Invalid solver output is reported as an error rather than silently drawn as zero.

### Why does DRT have no detected peaks?

Confirm that gamma is nonzero, enable Detect DRT peaks, inspect the selected calculation frequency range, and try a smaller λ or higher peak sensitivity. Peak resolution cannot exceed the information content of the measured frequency range.

### How should I choose λ?

Start with Auto and inspect residuals, smoothness, and peak stability. For sensitivity analysis, compare nearby values such as 1e-2, 1e-3, 1e-4, and 1e-5. Report the final value in the method section.

### Why does Windows show a command window?

The official portable entry point is Start_Auto_DRT_Analyzer_Windows.html. It does not use a CMD or PowerShell launcher. If a command window appears, a different third-party launcher or script was opened.

### Why did the application reopen after I closed it?

The included application contains no restart loop, background service, scheduled task, or window monitor. Close the browser tab or window that displays the analyzer. If it reopens, check browser session restore or an external launcher outside this repository.

### Why is there no independent Bode fit?

Bode magnitude and phase are mathematical views of the same complex impedance. Independent Bode optimization could produce parameters inconsistent with Nyquist. The software fits complex EIS once and derives all three fit views from that result.

### Are macOS and Windows features identical?

Yes for the core browser interface and algorithms. Both releases use the same HTML, CSS, and JavaScript source. The macOS .app adds an icon and launcher; the Windows release is a self-contained HTML file. There is currently no native Windows EXE installer.

## Known Limitations

- Automatic column detection is heuristic and should be confirmed by the user.
- Shift-JIS fallback depends on browser TextDecoder support.
- The equivalent-circuit builder supports the implemented component combinations; it is not a general SPICE editor.
- The interface currently uses one fixed light journal theme; there is no separate dark/light theme switch.
- The simple semi-infinite Warburg model may not represent finite-length diffusion.
- DRT is an ill-posed inverse problem. Peak count and width depend on frequency coverage, noise, λ, grid size, and tau padding.
- Very large project sets or grids run on the browser main thread and may take longer to update.
- PDF figure export is high-resolution raster content in a PDF container; use SVG when a true vector figure is required.
- The macOS app is not notarized.
- The Windows release is portable HTML, not an EXE/MSI installer.

## Privacy and Security

The application does not request microphone access, start a terminal, execute imported files, upload data, or run a background service. Analysis occurs locally in the browser. As with any scientific software, use trusted release files and verify exported results.

## License

Copyright (C) 2026 Xin Rong.

Auto DRT Analyzer is licensed under the GNU Affero General Public License v3.0. See LICENSE.txt and NOTICE for details.

## Citation

Please cite the archived software release:

    Xin Rong. Auto DRT Analyzer, version 1.0.2.
    Zenodo. https://doi.org/10.5281/zenodo.20756983

Citation metadata are also provided in CITATION.cff.

## Disclaimer

This software is provided as-is for academic and research use. Users are responsible for validating input data, imaginary-sign conventions, impedance units, electrode area, equivalent-circuit models, fitting parameters, DRT settings, peak assignments, exported results, and scientific interpretation. Auto DRT Analyzer does not replace independent electrochemical validation or expert judgment.
