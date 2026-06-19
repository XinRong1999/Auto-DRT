/*
 * Auto DRT Analyzer
 * Copyright (C) 2026 Xin Rong
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).
 * See LICENSE.txt for the full license text.
 */

const TAU = Math.PI * 2;
const SVG_NS = "http://www.w3.org/2000/svg";

const state = {
  datasets: [],
  activeIndex: -1,
  result: null,
  axisRanges: createAxisRangeState(),
  lastChartDomains: {},
  legendPositions: {},
  dragLegend: null,
  axisDialog: { chartKey: "", axis: "" },
  figureDialog: { chartKey: "" },
  environment: checkEnvironment(),
  language: getInitialLanguage(),
  drtAxis: getInitialPreference("auto-drt-axis", "frequency", ["frequency", "f", "tau", "relaxation"]),
  drtYAxisExpression: "gamma_f",
  bodePhaseExpression: getInitialPreference("auto-bode-phase-expression", "phase", ["phase", "theta", "phase_angle", "neg_phase", "neg_theta", "neg_phase_angle"]),
  nyquistXLabel: getInitialPreference("auto-nyquist-x-label", "zprime", ["zprime", "zre", "re_z"]),
  nyquistYLabel: getInitialPreference("auto-nyquist-y-label", "neg_zdoubleprime", ["neg_zdoubleprime", "neg_zim", "neg_im_z"]),
  bodeMagnitudeYLabel: getInitialPreference("auto-bode-mag-y-label", "abs_z", ["abs_z", "mod_z", "impedance"]),
  graphStyle: getInitialPreference("auto-drt-graph-style", "journal", ["journal", "presentation", "classic", "dark"]),
  showData: getInitialBool("auto-drt-show-data", true),
  showFit: getInitialBool("auto-drt-show-fit", true),
  showDrt: getInitialBool("auto-drt-show-drt", true),
  showPeaks: getInitialBool("auto-drt-show-peaks", false),
  drtRegions: defaultDrtRegions(),
  peakSensitivity: getInitialPreference("auto-drt-peak-sensitivity", "high", ["low", "normal", "high"]),
  pointShape: getInitialPreference("auto-drt-point-shape", "circle", ["circle", "square", "triangle", "diamond", "cross"]),
  pointSize: getInitialNumber("auto-drt-point-size", 4, 2, 12),
  labelSize: getInitialNumber("auto-drt-label-size", 12, 8, 20),
  dataColor: getInitialColor("auto-drt-data-color", ""),
  fitColor: getInitialColor("auto-drt-fit-color", ""),
  drtLineColor: getInitialColor("auto-drt-line-color", ""),
  pointColor: getInitialColor("auto-drt-point-color", "")
};

const el = {
  html: document.documentElement,
  body: document.body,
  fileInput: document.getElementById("fileInput"),
  sampleBtn: document.getElementById("sampleBtn"),
  openFileLabel: document.getElementById("openFileLabel"),
  projectNameInput: document.getElementById("projectNameInput"),
  fileSelectField: document.getElementById("fileSelectField"),
  fileSelect: document.getElementById("fileSelect"),
  projectList: document.getElementById("projectList"),
  gridSizeInput: document.getElementById("gridSizeInput"),
  lambdaModeSelect: document.getElementById("lambdaModeSelect"),
  analysisModeSelect: document.getElementById("analysisModeSelect"),
  manualLambdaField: document.getElementById("manualLambdaField"),
  manualLambdaInput: document.getElementById("manualLambdaInput"),
  tauPaddingSelect: document.getElementById("tauPaddingSelect"),
  fixRsInput: document.getElementById("fixRsInput"),
  rsValueField: document.getElementById("rsValueField"),
  rsValueInput: document.getElementById("rsValueInput"),
  addDrtRegionBtn: document.getElementById("addDrtRegionBtn"),
  drtRegionList: document.getElementById("drtRegionList"),
  graphStyleSelect: document.getElementById("graphStyleSelect"),
  showDataInput: document.getElementById("showDataInput"),
  showFitInput: document.getElementById("showFitInput"),
  showDrtInput: document.getElementById("showDrtInput"),
  showPeaksProjectInput: document.getElementById("showPeaksProjectInput"),
  dataColorInput: document.getElementById("dataColorInput"),
  fitColorInput: document.getElementById("fitColorInput"),
  pointColorInput: document.getElementById("pointColorInput"),
  pointShapeSelect: document.getElementById("pointShapeSelect"),
  pointSizeInput: document.getElementById("pointSizeInput"),
  pointSizeValue: document.getElementById("pointSizeValue"),
  labelSizeInput: document.getElementById("labelSizeInput"),
  labelSizeValue: document.getElementById("labelSizeValue"),
  peakSensitivitySelect: document.getElementById("peakSensitivitySelect"),
  detectPeaksBtn: document.getElementById("detectPeaksBtn"),
  showPeaksInput: document.getElementById("showPeaksInput"),
  axisRangeDialog: document.getElementById("axisRangeDialog"),
  axisRangeCloseBtn: document.getElementById("axisRangeCloseBtn"),
  axisRangeChartLabel: document.getElementById("axisRangeChartLabel"),
  axisExpressionField: document.getElementById("axisExpressionField"),
  axisExpressionLabel: document.getElementById("axisExpressionLabel"),
  axisExpressionSelect: document.getElementById("axisExpressionSelect"),
  electrodeAreaField: document.getElementById("electrodeAreaField"),
  electrodeAreaLabel: document.getElementById("electrodeAreaLabel"),
  electrodeAreaInput: document.getElementById("electrodeAreaInput"),
  axisRangeAutoInput: document.getElementById("axisRangeAutoInput"),
  axisRangeMinInput: document.getElementById("axisRangeMinInput"),
  axisRangeMaxInput: document.getElementById("axisRangeMaxInput"),
  axisRangeError: document.getElementById("axisRangeError"),
  axisRangeResetBtn: document.getElementById("axisRangeResetBtn"),
  axisRangeApplyBtn: document.getElementById("axisRangeApplyBtn"),
  analyzeBtn: document.getElementById("analyzeBtn"),
  exportExcelBtn: document.getElementById("exportExcelBtn"),
  exportFitDataBtn: document.getElementById("exportFitDataBtn"),
  figureSaveButtons: Array.from(document.querySelectorAll(".chart-save-btn[data-chart-key]")),
  figureSaveDialog: document.getElementById("figureSaveDialog"),
  figureSaveCloseBtn: document.getElementById("figureSaveCloseBtn"),
  figureSaveChartLabel: document.getElementById("figureSaveChartLabel"),
  figureFormatSelect: document.getElementById("figureFormatSelect"),
  figureSaveCancelBtn: document.getElementById("figureSaveCancelBtn"),
  figureSaveApplyBtn: document.getElementById("figureSaveApplyBtn"),
  equivalentCircuitText: document.getElementById("equivalentCircuitText"),
  circuitDiagram: document.getElementById("circuitDiagram"),
  saveCircuitBtn: document.getElementById("saveCircuitBtn"),
  circuitElementList: document.getElementById("circuitElementList"),
  addCircuitElementSelect: document.getElementById("addCircuitElementSelect"),
  addCircuitElementBtn: document.getElementById("addCircuitElementBtn"),
  removeCircuitElementBtn: document.getElementById("removeCircuitElementBtn"),
  resetCircuitBtn: document.getElementById("resetCircuitBtn"),
  refitBtn: document.getElementById("refitBtn"),
  fitStatusText: document.getElementById("fitStatusText"),
  fitParamsBody: document.getElementById("fitParamsBody"),
  drtContextMenu: document.getElementById("drtContextMenu"),
  statusText: document.getElementById("statusText"),
  summaryPoints: document.getElementById("summaryPoints"),
  summaryFreq: document.getElementById("summaryFreq"),
  summaryLambda: document.getElementById("summaryLambda"),
  summaryPeaks: document.getElementById("summaryPeaks"),
  summaryDrtAxis: document.getElementById("summaryDrtAxis"),
  summaryDrtYLabel: document.getElementById("summaryDrtYLabel"),
  eisQualityPoints: document.getElementById("eisQualityPoints"),
  eisQualityFreq: document.getElementById("eisQualityFreq"),
  eisQualityRinf: document.getElementById("eisQualityRinf"),
  eisQualityRmse: document.getElementById("eisQualityRmse"),
  peaksTableBody: document.getElementById("peaksTableBody"),
  drtAreaTableBody: document.getElementById("drtAreaTableBody"),
  runLog: document.getElementById("runLog"),
  languageButtons: Array.from(document.querySelectorAll(".language-button")),
  nyquistChart: document.getElementById("nyquistChart"),
  bodeMagnitudeChart: document.getElementById("bodeMagnitudeChart"),
  bodePhaseChart: document.getElementById("bodePhaseChart"),
  drtChart: document.getElementById("drtChart"),
  residualChart: document.getElementById("residualChart")
};

const graphStylePresets = {
  journal: {
    data: "#111827",
    fit: "#b45309",
    phaseData: "#111827",
    phaseFit: "#b45309",
    residualReal: "#111827",
    residualImag: "#b45309",
    gamma: "#111827",
    peak: "#b45309",
    lineWidth: 1.9,
    pointRadius: 2.8,
    peakRadius: 5.2,
    legendLineWidth: 2.4,
    showGrid: false
  },
  presentation: {
    data: "#0f766e",
    fit: "#ea580c",
    phaseData: "#2563eb",
    phaseFit: "#dc2626",
    residualReal: "#2563eb",
    residualImag: "#dc2626",
    gamma: "#0f766e",
    peak: "#ea580c",
    lineWidth: 3.1,
    pointRadius: 4.3,
    peakRadius: 6,
    legendLineWidth: 3.5,
    showGrid: false
  },
  classic: {
    data: "#1f77b4",
    fit: "#ff7f0e",
    phaseData: "#1f77b4",
    phaseFit: "#d62728",
    residualReal: "#1f77b4",
    residualImag: "#d62728",
    gamma: "#2ca02c",
    peak: "#ff7f0e",
    lineWidth: 2.3,
    pointRadius: 3.4,
    peakRadius: 5.4,
    legendLineWidth: 3,
    showGrid: false
  },
  dark: {
    data: "#5eead4",
    fit: "#fbbf24",
    phaseData: "#60a5fa",
    phaseFit: "#fb7185",
    residualReal: "#60a5fa",
    residualImag: "#fb7185",
    gamma: "#5eead4",
    peak: "#fbbf24",
    lineWidth: 2.6,
    pointRadius: 3.8,
    peakRadius: 5.8,
    legendLineWidth: 3.2,
    showGrid: false
  }
};

const translations = {
  en: {
    noDataset: "No dataset loaded",
    analysisActions: "Analysis actions",
    sample: "Sample",
    sampleTitle: "Load synthetic EIS data",
    open: "Open",
    openTitle: "Open EIS files",
    exportExcel: "Export DRT Data",
    exportExcelTitle: "Export current DRT x-y data",
    exportFitData: "Export Fit Data",
    exportFitDataTitle: "Export current EIS fitted x-y data",
    exportedDrtData: "DRT x-y data exported",
    exportedFitData: "Fit x-y data exported",
    noVisibleDrtData: "No visible DRT curve to export.",
    noVisibleFitData: "No visible fit curve to export.",
    save: "Save",
    saveFigure: "Save figure",
    format: "Format",
    cancel: "Cancel",
    equivalentCircuit: "Equivalent circuit:",
    equivalentCircuitHeading: "Equivalent circuit",
    textMode: "Text mode:",
    diagramMode: "Diagram mode:",
    saveCircuit: "Save circuit",
    circuitSettings: "Circuit settings",
    circuitModel: "Circuit model",
    seriesElements: "Series elements",
    elementType: "Element type",
    addElement: "Add element",
    add: "Add",
    deleteSelected: "Delete selected",
    resetDefault: "Reset default",
    rsCannotDelete: "Rs cannot be deleted.",
    circuitModelChanged: "Circuit model changed. Refitting with the selected model.",
    circuitChangedRefit: "Circuit changed. Please click Refit.",
    circuitResetRefit: "Circuit reset. Please click Refit.",
    fittingFailed: "Fitting failed for current circuit. Please simplify the circuit or check the data.",
    refit: "Refit",
    addDrtPeakHere: "Add DRT peak here",
    removeThisPeak: "Remove this peak",
    clearManualPeaks: "Clear manual peaks",
    resetAutomaticPeaks: "Reset automatic peaks",
    fitStatusUpdated: "Fitting status: updated",
    fitStatusOutdated: "Fitting status: outdated",
    fitStatusFailed: "Fitting status: failed",
    currentFittingModel: "Current fitting model",
    modelImplemented: "Model implemented",
    fittingUpdated: "Fitting updated after model change",
    fitQuality: "Fit quality",
    yes: "Yes",
    experimental: "experimental",
    fittingParameters: "Fitting parameters",
    parameter: "Parameter",
    value: "Value",
    unit: "Unit",
    note: "Note",
    fixed: "fixed",
    free: "free",
    unavailable: "N/A",
    enterRs: "Please enter Rohm / Rs value.",
    dataset: "Dataset",
    file: "Original file",
    projectName: "Project name",
    projectPreferences: "Project preferences",
    advancedSettings: "Advanced settings",
    loadedProjects: "Loaded projects",
    deleteProject: "Delete",
    grid: "DRT points",
    drtGridChanged: "DRT points changed. Recalculating selected project.",
    drtRegionHeading: "DRT frequency regions",
    addRegion: "Add region",
    deleteRegion: "Delete",
    regionName: "Region",
    lowerHz: "Lower Hz",
    upperHz: "Upper Hz",
    drtAreaAnalysis: "DRT area analysis",
    drtArea: "Area",
    lambda: "Lambda",
    auto: "Auto",
    manual: "Manual",
    manualLambda: "Manual lambda",
    tauPadding: "Tau padding",
    analysisMode: "Analysis mode",
    modeBalanced: "Balanced",
    modeFit: "Fit priority",
    modeSmooth: "DRT smooth",
    fixRs: "Fix Rohm / Rs",
    rsValue: "Rohm / Rs value",
    graph: "Graph settings",
    graphStyle: "Graph style",
    expressionUnit: "Axis label",
    electrodeArea: "Electrode area / cm²",
    impedanceOhm: "Ω",
    impedanceArea: "Ω cm²",
    gammaF: "γ(f) / Ω",
    gammaTau: "γ(τ) / Ω",
    drtgF: "DRT-g(f) / Ω·s",
    gammaFArea: "γ(f) / Ω cm²",
    gammaTauArea: "γ(τ) / Ω cm²",
    drtgFArea: "DRT-g(f) / Ω cm²·s",
    fHzShort: "f / Hz",
    relaxationTime: "Relaxation time / s",
    phaseDegShort: "Phase / deg.",
    thetaDegree: "θ / °",
    phaseAngleDegree: "Phase angle / °",
    negativePhaseDeg: "-Phase / deg.",
    negativeThetaDegree: "-θ / °",
    negativePhaseAngleDegree: "-Phase angle / °",
    showData: "Data",
    showFit: "Fit",
    showDrt: "DRT",
    dataColor: "Project color",
    fitColor: "Fit color",
    pointColor: "Peak color",
    pointShape: "Point shape",
    pointSize: "Point size",
    labelSize: "Label size",
    peakSensitivity: "Peak sensitivity",
    sensitivityLow: "Low",
    sensitivityNormal: "Normal",
    sensitivityHigh: "High",
    detectPeaks: "Detect DRT peaks",
    showPeaks: "Show DRT peaks",
    peakProject: "Project name",
    peakName: "Peak name",
    peakNumber: "Peak number",
    peakSource: "Source",
    peakSourceAuto: "Auto",
    peakSourceManual: "Manual",
    renamePeak: "Peak name",
    peakFrequency: "Frequency / Hz",
    peakTau: "tau / s",
    peakGamma: "gamma",
    peakRelative: "Relative intensity",
    peakProcess: "Suggested process",
    originalFile: "Original file name",
    axisRange: "Axis range",
    autoRange: "Auto range",
    minimum: "Minimum",
    maximum: "Maximum",
    apply: "Apply",
    reset: "Reset",
    close: "Close",
    xAxisRange: "X-axis range",
    yAxisRange: "Y-axis range",
    xAxisSettings: "X-axis settings",
    yAxisSettings: "Y-axis settings",
    invalidRange: "Enter a minimum smaller than the maximum.",
    positiveRange: "Log-scale axes need values greater than 0.",
    invalidArea: "Enter an electrode area greater than 0.",
    environmentReady: "Environment ready: no Python, pip, conda, or DRT package installation required.",
    environmentMissing: "Browser missing required local APIs",
    shapeCircle: "Circle",
    shapeSquare: "Square",
    shapeTriangle: "Triangle",
    shapeDiamond: "Diamond",
    shapeCross: "Cross",
    axisTau: "tau / s",
    axisFrequency: "Frequency / Hz",
    styleJournal: "Journal",
    stylePresentation: "Presentation",
    styleClassic: "Classic",
    styleDark: "Dark",
    analyze: "Analyze",
    summary: "DRT summary",
    eisFittingQuality: "EIS fitting quality",
    points: "Points",
    frequency: "Frequency",
    selectedLambda: "Selected lambda",
    drtXAxisMode: "DRT x-axis mode",
    drtYAxisLabel: "DRT y-axis label",
    detectedPeakCount: "Detected peaks",
    peaks: "DRT peaks",
    views: "Views",
    diagnostics: "Diagnostics",
    eisPlots: "EIS plots",
    drtPlots: "DRT plots",
    runDiagnostics: "Run diagnostics",
    bodeMagnitude: "Bode magnitude",
    bodePhase: "Bode phase",
    distribution: "DRT",
    residual: "Relative residual",
    runLog: "Run log",
    noRun: "No run yet.",
    loadDataset: "Load a dataset",
    noSeries: "Select project or fit",
    data: "Data",
    fit: "Fit",
    statusAnalyzed: "analyzed",
    statusNoValid: "No valid EIS data found",
    statusFailed: "Analysis failed",
    statusPoints: "points",
    inputImaginary: "Input imaginary column interpreted as",
    tauGrid: "Tau grid",
    observableTauWindow: "Observable tau window",
    rinfEstimate: "Rinf estimate",
    normalizedRmse: "Normalized RMSE",
    detectedPeaks: "Detected peaks",
    none: "none",
    highFrequencyProcess: "candidate: high-frequency process",
    interfaceProcess: "candidate: interface or film process",
    chargeTransferProcess: "candidate: charge-transfer process",
    transportProcess: "candidate: transport or diffusion process",
    zreOhm: "Zre / ohm",
    znegImagOhm: "-Zim / ohm",
    frequencyHz: "Frequency / Hz",
    magnitudeOhm: "|Z| / ohm",
    phaseDegree: "Phase / degree",
    tauS: "tau / s",
    gammaOhm: "gamma / ohm",
    residualOhm: "Residual / ohm"
  },
  ja: {
    noDataset: "データセット未読込",
    analysisActions: "解析操作",
    sample: "サンプル",
    sampleTitle: "合成EISデータを読み込む",
    open: "開く",
    openTitle: "EISファイルを開く",
    exportExcel: "DRTデータ出力",
    exportExcelTitle: "現在表示中のDRT x-yデータを出力",
    exportFitData: "Fitデータ出力",
    exportFitDataTitle: "現在表示中のEISフィットx-yデータを出力",
    exportedDrtData: "DRT x-yデータを出力しました",
    exportedFitData: "Fit x-yデータを出力しました",
    noVisibleDrtData: "出力できる表示中のDRT曲線がありません。",
    noVisibleFitData: "出力できる表示中のFit曲線がありません。",
    save: "保存",
    saveFigure: "図を保存",
    format: "形式",
    cancel: "キャンセル",
    equivalentCircuit: "等価回路:",
    equivalentCircuitHeading: "等価回路",
    textMode: "文字表示:",
    diagramMode: "図表示:",
    saveCircuit: "回路を保存",
    circuitSettings: "回路設定",
    circuitModel: "回路モデル",
    seriesElements: "直列要素",
    elementType: "要素タイプ",
    addElement: "要素を追加",
    add: "追加",
    deleteSelected: "選択を削除",
    resetDefault: "初期回路に戻す",
    rsCannotDelete: "Rsは削除できません。",
    circuitModelChanged: "回路モデルを変更しました。選択モデルで再フィットしています。",
    circuitChangedRefit: "回路が変更されました。Refitをクリックしてください。",
    circuitResetRefit: "回路を初期化しました。Refitをクリックしてください。",
    fittingFailed: "現在の回路でフィットに失敗しました。回路を簡略化するかデータを確認してください。",
    refit: "再フィット",
    addDrtPeakHere: "ここにDRTピークを追加",
    removeThisPeak: "このピークを削除",
    clearManualPeaks: "手動ピークをクリア",
    resetAutomaticPeaks: "自動ピークをリセット",
    fitStatusUpdated: "フィット状態: 更新済み",
    fitStatusOutdated: "フィット状態: 未更新",
    fitStatusFailed: "フィット状態: 失敗",
    currentFittingModel: "現在のフィットモデル",
    modelImplemented: "モデル実装済み",
    fittingUpdated: "モデル変更後にフィット更新",
    fitQuality: "フィット品質",
    yes: "はい",
    experimental: "試験的",
    fittingParameters: "フィットパラメータ",
    parameter: "パラメータ",
    value: "値",
    unit: "単位",
    note: "注記",
    fixed: "固定",
    free: "自由",
    unavailable: "N/A",
    enterRs: "Rohm / Rs値を入力してください。",
    dataset: "データセット",
    file: "元ファイル",
    projectName: "プロジェクト名",
    projectPreferences: "プロジェクト設定",
    advancedSettings: "詳細設定",
    loadedProjects: "読み込み済みプロジェクト",
    deleteProject: "削除",
    grid: "DRT点数",
    drtGridChanged: "DRT点数を変更しました。選択中のプロジェクトを再計算しています。",
    drtRegionHeading: "DRT周波数領域",
    addRegion: "領域を追加",
    deleteRegion: "削除",
    regionName: "領域",
    lowerHz: "下限 Hz",
    upperHz: "上限 Hz",
    drtAreaAnalysis: "DRT面積解析",
    drtArea: "面積",
    lambda: "ラムダ",
    auto: "自動",
    manual: "手動",
    manualLambda: "手動ラムダ",
    tauPadding: "タウ余白",
    analysisMode: "解析モード",
    modeBalanced: "バランス",
    modeFit: "フィット優先",
    modeSmooth: "DRT平滑",
    fixRs: "Rohm / Rs固定",
    rsValue: "Rohm / Rs 値",
    graph: "グラフ設定",
    graphStyle: "グラフ形式",
    expressionUnit: "軸ラベル",
    electrodeArea: "電極面積 / cm²",
    impedanceOhm: "Ω",
    impedanceArea: "Ω cm²",
    gammaF: "γ(f) / Ω",
    gammaTau: "γ(τ) / Ω",
    drtgF: "DRT-g(f) / Ω·s",
    gammaFArea: "γ(f) / Ω cm²",
    gammaTauArea: "γ(τ) / Ω cm²",
    drtgFArea: "DRT-g(f) / Ω cm²·s",
    fHzShort: "f / Hz",
    relaxationTime: "緩和時間 / s",
    phaseDegShort: "Phase / deg.",
    thetaDegree: "θ / °",
    phaseAngleDegree: "Phase angle / °",
    negativePhaseDeg: "-Phase / deg.",
    negativeThetaDegree: "-θ / °",
    negativePhaseAngleDegree: "-Phase angle / °",
    showData: "データ",
    showFit: "フィット",
    showDrt: "DRT",
    dataColor: "プロジェクト色",
    fitColor: "フィット色",
    pointColor: "ピーク色",
    pointShape: "点形状",
    pointSize: "点サイズ",
    labelSize: "ラベルサイズ",
    peakSensitivity: "ピーク感度",
    sensitivityLow: "低",
    sensitivityNormal: "標準",
    sensitivityHigh: "高",
    detectPeaks: "DRTピーク検出",
    showPeaks: "DRTピーク表示",
    peakProject: "プロジェクト名",
    peakName: "ピーク名",
    peakNumber: "ピーク番号",
    peakSource: "由来",
    peakSourceAuto: "自動",
    peakSourceManual: "手動",
    renamePeak: "ピーク名",
    peakFrequency: "周波数 / Hz",
    peakTau: "tau / s",
    peakGamma: "gamma",
    peakRelative: "相対強度",
    peakProcess: "推定プロセス",
    originalFile: "元ファイル名",
    axisRange: "軸範囲",
    autoRange: "自動範囲",
    minimum: "最小値",
    maximum: "最大値",
    apply: "適用",
    reset: "リセット",
    close: "閉じる",
    xAxisRange: "X軸範囲",
    yAxisRange: "Y軸範囲",
    xAxisSettings: "X軸設定",
    yAxisSettings: "Y軸設定",
    invalidRange: "最小値は最大値より小さくしてください。",
    positiveRange: "対数軸では0より大きい値が必要です。",
    invalidArea: "0より大きい電極面積を入力してください。",
    environmentReady: "環境は準備済み: Python、pip、conda、DRTパッケージのインストールは不要です。",
    environmentMissing: "ブラウザのローカルAPIが不足しています",
    shapeCircle: "丸",
    shapeSquare: "四角",
    shapeTriangle: "三角",
    shapeDiamond: "ひし形",
    shapeCross: "クロス",
    axisTau: "tau / s",
    axisFrequency: "周波数 / Hz",
    styleJournal: "論文",
    stylePresentation: "発表",
    styleClassic: "クラシック",
    styleDark: "ダーク",
    analyze: "解析",
    summary: "DRT概要",
    eisFittingQuality: "EISフィット品質",
    points: "点数",
    frequency: "周波数",
    selectedLambda: "選択ラムダ",
    drtXAxisMode: "DRT X軸モード",
    drtYAxisLabel: "DRT Y軸ラベル",
    detectedPeakCount: "検出ピーク数",
    peaks: "DRTピーク",
    views: "表示",
    diagnostics: "診断",
    eisPlots: "EISプロット",
    drtPlots: "DRTプロット",
    runDiagnostics: "解析診断",
    bodeMagnitude: "Bode 振幅",
    bodePhase: "Bode 位相",
    distribution: "DRT",
    residual: "相対残差",
    runLog: "実行ログ",
    noRun: "まだ実行していません。",
    loadDataset: "データセットを読み込んでください",
    noSeries: "プロジェクトまたはフィットを選択",
    data: "データ",
    fit: "フィット",
    statusAnalyzed: "を解析しました",
    statusNoValid: "有効なEISデータが見つかりません",
    statusFailed: "解析に失敗しました",
    statusPoints: "点",
    inputImaginary: "虚数列の解釈",
    tauGrid: "タウグリッド",
    observableTauWindow: "観測可能タウ範囲",
    rinfEstimate: "Rinf 推定値",
    normalizedRmse: "正規化RMSE",
    detectedPeaks: "検出ピーク",
    none: "なし",
    highFrequencyProcess: "候補: 高周波プロセス",
    interfaceProcess: "候補: 界面または膜プロセス",
    chargeTransferProcess: "候補: 電荷移動プロセス",
    transportProcess: "候補: 輸送または拡散プロセス",
    zreOhm: "Zre / ohm",
    znegImagOhm: "-Zim / ohm",
    frequencyHz: "周波数 / Hz",
    magnitudeOhm: "|Z| / ohm",
    phaseDegree: "位相 / degree",
    tauS: "tau / s",
    gammaOhm: "gamma / ohm",
    residualOhm: "残差 / ohm"
  },
  zh: {
    noDataset: "未加载数据集",
    analysisActions: "分析操作",
    sample: "样本",
    sampleTitle: "加载合成 EIS 数据",
    open: "打开",
    openTitle: "打开 EIS 文件",
    exportExcel: "导出 DRT 数据",
    exportExcelTitle: "导出当前 DRT 图的 x-y 数据",
    exportFitData: "导出 Fit 数据",
    exportFitDataTitle: "导出当前 EIS fit 曲线的 x-y 数据",
    exportedDrtData: "已导出 DRT x-y 数据",
    exportedFitData: "已导出 Fit x-y 数据",
    noVisibleDrtData: "没有可导出的可见 DRT 曲线。",
    noVisibleFitData: "没有可导出的可见 Fit 曲线。",
    save: "保存",
    saveFigure: "保存图",
    format: "格式",
    cancel: "取消",
    equivalentCircuit: "等效电路:",
    equivalentCircuitHeading: "等效电路",
    textMode: "文字模式:",
    diagramMode: "图示模式:",
    saveCircuit: "保存电路",
    circuitSettings: "电路设置",
    circuitModel: "电路模型",
    seriesElements: "串联元素",
    elementType: "元素类型",
    addElement: "添加元素",
    add: "添加",
    deleteSelected: "删除所选",
    resetDefault: "恢复默认",
    rsCannotDelete: "Rs 不能删除。",
    circuitModelChanged: "电路模型已改变，正在用选中的模型重新拟合。",
    circuitChangedRefit: "电路已改变，请点击 Refit 重新拟合。",
    circuitResetRefit: "电路已恢复默认，请点击 Refit 重新拟合。",
    fittingFailed: "当前电路拟合失败。请简化电路或检查数据。",
    refit: "重新拟合",
    addDrtPeakHere: "在这里添加 DRT 峰",
    removeThisPeak: "删除这个峰",
    clearManualPeaks: "清除手动峰",
    resetAutomaticPeaks: "重置自动峰",
    fitStatusUpdated: "拟合状态: 已更新",
    fitStatusOutdated: "拟合状态: 未更新",
    fitStatusFailed: "拟合状态: 失败",
    currentFittingModel: "当前真实拟合模型",
    modelImplemented: "模型已实现",
    fittingUpdated: "模型改变后拟合已更新",
    fitQuality: "拟合质量",
    yes: "是",
    experimental: "实验性",
    fittingParameters: "拟合参数",
    parameter: "参数",
    value: "数值",
    unit: "单位",
    note: "备注",
    fixed: "固定",
    free: "自由",
    unavailable: "N/A",
    enterRs: "请输入 Rohm / Rs 数值。",
    dataset: "数据集",
    file: "原始文件",
    projectName: "项目名",
    projectPreferences: "项目偏好",
    advancedSettings: "高级设置",
    loadedProjects: "已加载项目",
    deleteProject: "删除",
    grid: "DRT 点数",
    drtGridChanged: "DRT 点数已改变，正在重新计算当前项目。",
    drtRegionHeading: "DRT 频率区域",
    addRegion: "添加区域",
    deleteRegion: "删除",
    regionName: "区域",
    lowerHz: "低频 Hz",
    upperHz: "高频 Hz",
    drtAreaAnalysis: "DRT 面积分析",
    drtArea: "面积",
    lambda: "Lambda",
    auto: "自动",
    manual: "手动",
    manualLambda: "手动 lambda",
    tauPadding: "Tau 延展",
    analysisMode: "分析模式",
    modeBalanced: "平衡",
    modeFit: "拟合优先",
    modeSmooth: "DRT 平滑",
    fixRs: "固定 Rohm / Rs",
    rsValue: "Rohm / Rs 数值",
    graph: "图形设置",
    graphStyle: "图形格式",
    expressionUnit: "坐标轴标签",
    electrodeArea: "电极面积 / cm²",
    impedanceOhm: "Ω",
    impedanceArea: "Ω cm²",
    gammaF: "γ(f) / Ω",
    gammaTau: "γ(τ) / Ω",
    drtgF: "DRT-g(f) / Ω·s",
    gammaFArea: "γ(f) / Ω cm²",
    gammaTauArea: "γ(τ) / Ω cm²",
    drtgFArea: "DRT-g(f) / Ω cm²·s",
    fHzShort: "f / Hz",
    relaxationTime: "弛豫时间 / s",
    phaseDegShort: "Phase / deg.",
    thetaDegree: "θ / °",
    phaseAngleDegree: "Phase angle / °",
    negativePhaseDeg: "-Phase / deg.",
    negativeThetaDegree: "-θ / °",
    negativePhaseAngleDegree: "-Phase angle / °",
    showData: "数据",
    showFit: "拟合",
    showDrt: "DRT",
    dataColor: "项目颜色",
    fitColor: "拟合颜色",
    pointColor: "峰颜色",
    pointShape: "点样式",
    pointSize: "点大小",
    labelSize: "文字大小",
    peakSensitivity: "峰识别灵敏度",
    sensitivityLow: "低",
    sensitivityNormal: "标准",
    sensitivityHigh: "高",
    detectPeaks: "识别 DRT 峰",
    showPeaks: "显示 DRT 峰",
    peakProject: "项目名",
    peakName: "峰名称",
    peakNumber: "峰编号",
    peakSource: "来源",
    peakSourceAuto: "自动",
    peakSourceManual: "手动",
    renamePeak: "峰名称",
    peakFrequency: "频率 / Hz",
    peakTau: "tau / s",
    peakGamma: "gamma",
    peakRelative: "相对强度",
    peakProcess: "建议过程",
    originalFile: "原始文件名",
    axisRange: "坐标范围",
    autoRange: "自动范围",
    minimum: "最小值",
    maximum: "最大值",
    apply: "应用",
    reset: "重置",
    close: "关闭",
    xAxisRange: "X 轴范围",
    yAxisRange: "Y 轴范围",
    xAxisSettings: "X 轴设置",
    yAxisSettings: "Y 轴设置",
    invalidRange: "请输入小于最大值的最小值。",
    positiveRange: "对数坐标需要大于 0 的数值。",
    invalidArea: "请输入大于 0 的电极面积。",
    environmentReady: "环境已就绪：不需要安装 Python、pip、conda 或 DRT 包。",
    environmentMissing: "浏览器缺少必要的本地 API",
    shapeCircle: "圆点",
    shapeSquare: "方块",
    shapeTriangle: "三角",
    shapeDiamond: "菱形",
    shapeCross: "十字",
    axisTau: "tau / s",
    axisFrequency: "频率 / Hz",
    styleJournal: "论文",
    stylePresentation: "演示",
    styleClassic: "经典",
    styleDark: "深色",
    analyze: "分析",
    summary: "DRT 摘要",
    eisFittingQuality: "EIS 拟合质量",
    points: "点数",
    frequency: "频率",
    selectedLambda: "选中的 lambda",
    drtXAxisMode: "DRT x 轴模式",
    drtYAxisLabel: "DRT y 轴标签",
    detectedPeakCount: "识别峰数量",
    peaks: "DRT 峰",
    views: "视图",
    diagnostics: "诊断",
    eisPlots: "EIS 图",
    drtPlots: "DRT 图",
    runDiagnostics: "运行诊断",
    bodeMagnitude: "Bode 幅值",
    bodePhase: "Bode 相位",
    distribution: "DRT",
    residual: "相对残差",
    runLog: "运行日志",
    noRun: "尚未运行。",
    loadDataset: "请加载数据集",
    noSeries: "请选择项目或拟合",
    data: "数据",
    fit: "拟合",
    statusAnalyzed: "已分析",
    statusNoValid: "未找到有效的 EIS 数据",
    statusFailed: "分析失败",
    statusPoints: "点",
    inputImaginary: "虚部列解释为",
    tauGrid: "Tau 网格",
    observableTauWindow: "可观测 tau 范围",
    rinfEstimate: "Rinf 估计",
    normalizedRmse: "归一化 RMSE",
    detectedPeaks: "检测到的峰",
    none: "无",
    highFrequencyProcess: "候选: 高频过程",
    interfaceProcess: "候选: 界面或膜过程",
    chargeTransferProcess: "候选: 电荷转移过程",
    transportProcess: "候选: 传输或扩散过程",
    zreOhm: "Zre / ohm",
    znegImagOhm: "-Zim / ohm",
    frequencyHz: "频率 / Hz",
    magnitudeOhm: "|Z| / ohm",
    phaseDegree: "相位 / degree",
    tauS: "tau / s",
    gammaOhm: "gamma / ohm",
    residualOhm: "残差 / ohm"
  }
};

const uiBindings = [
  ["sampleBtn", "sample"],
  ["datasetHeading", "dataset"],
  ["projectNameLabel", "projectName"],
  ["projectPreferencesSummary", "projectPreferences"],
  ["advancedSettingsSummary", "advancedSettings"],
  ["fileLabel", "file"],
  ["loadedProjectsLabel", "loadedProjects"],
  ["gridLabel", "grid"],
  ["lambdaLabel", "lambda"],
  ["analysisModeLabel", "analysisMode"],
  ["manualLambdaLabel", "manualLambda"],
  ["tauPaddingLabel", "tauPadding"],
  ["fixRsLabel", "fixRs"],
  ["rsValueLabel", "rsValue"],
  ["drtRegionHeading", "drtRegionHeading"],
  ["addDrtRegionBtn", "addRegion"],
  ["graphHeading", "graph"],
  ["graphStyleLabel", "graphStyle"],
  ["showDataLabel", "showData"],
  ["showFitLabel", "showFit"],
  ["showDrtLabel", "showDrt"],
  ["showPeaksProjectLabel", "showPeaks"],
  ["dataColorLabel", "dataColor"],
  ["fitColorLabel", "fitColor"],
  ["pointColorLabel", "pointColor"],
  ["pointShapeLabel", "pointShape"],
  ["pointSizeLabel", "pointSize"],
  ["labelSizeLabel", "labelSize"],
  ["peakSensitivityLabel", "peakSensitivity"],
  ["detectPeaksBtn", "detectPeaks"],
  ["showPeaksLabel", "showPeaks"],
  ["peakProjectHeader", "peakProject"],
  ["peakNameHeader", "peakName"],
  ["peakNumberHeader", "peakNumber"],
  ["peakSourceHeader", "peakSource"],
  ["peakFrequencyHeader", "peakFrequency"],
  ["peakTauHeader", "peakTau"],
  ["peakGammaHeader", "peakGamma"],
  ["peakRelativeHeader", "peakRelative"],
  ["peakProcessHeader", "peakProcess"],
  ["drtAreaHeading", "drtAreaAnalysis"],
  ["areaProjectHeader", "peakProject"],
  ["areaRegionHeader", "regionName"],
  ["areaLowerHeader", "lowerHz"],
  ["areaUpperHeader", "upperHz"],
  ["areaValueHeader", "drtArea"],
  ["axisRangeHeading", "axisRange"],
  ["axisExpressionLabel", "expressionUnit"],
  ["electrodeAreaLabel", "electrodeArea"],
  ["axisRangeAutoLabel", "autoRange"],
  ["axisRangeMinLabel", "minimum"],
  ["axisRangeMaxLabel", "maximum"],
  ["axisRangeResetBtn", "reset"],
  ["axisRangeApplyBtn", "apply"],
  ["saveFigureHeading", "saveFigure"],
  ["figureFormatLabel", "format"],
  ["figureSaveCancelBtn", "cancel"],
  ["figureSaveApplyBtn", "save"],
  ["equivalentCircuitLabel", "textMode"],
  ["diagramModeLabel", "diagramMode"],
  ["equivalentCircuitHeading", "equivalentCircuitHeading"],
  ["saveCircuitBtn", "saveCircuit"],
  ["circuitSettingsSummary", "circuitSettings"],
  ["seriesElementsLabel", "seriesElements"],
  ["elementTypeLabel", "elementType"],
  ["addCircuitElementBtn", "addElement"],
  ["removeCircuitElementBtn", "deleteSelected"],
  ["resetCircuitBtn", "resetDefault"],
  ["fitParamsHeading", "fittingParameters"],
  ["refitBtn", "refit"],
  ["fitParamHeader", "parameter"],
  ["fitValueHeader", "value"],
  ["fitUnitHeader", "unit"],
  ["fitNoteHeader", "note"],
  ["analyzeBtn", "analyze"],
  ["summaryHeading", "summary"],
  ["eisQualityHeading", "eisFittingQuality"],
  ["pointsLabel", "points"],
  ["eisPointsLabel", "points"],
  ["frequencyLabel", "frequency"],
  ["eisFrequencyLabel", "frequency"],
  ["selectedLambdaLabel", "selectedLambda"],
  ["peaksSummaryLabel", "detectedPeakCount"],
  ["drtXAxisModeLabel", "drtXAxisMode"],
  ["drtYAxisLabelLabel", "drtYAxisLabel"],
  ["peaksHeading", "peaks"],
  ["diagnosticsTab", "diagnostics"],
  ["bodeMagnitudeHeading", "bodeMagnitude"],
  ["bodePhaseHeading", "bodePhase"],
  ["distributionHeading", "distribution"],
  ["residualHeading", "residual"],
  ["runLogHeading", "runLog"]
];

applyGraphStyle(state.graphStyle);
applyLanguage(state.language);
renderDrtRegionList();
drawEmptyCharts();
renderCircuitModel();
syncAreaControls();

el.fileInput.addEventListener("change", handleFiles);
el.sampleBtn.addEventListener("click", loadSample);
el.projectNameInput.addEventListener("input", () => {
  const dataset = getActiveDataset();
  if (!dataset) return;
  dataset.projectName = el.projectNameInput.value || stripExtension(dataset.name);
  if (state.result?.dataset === dataset) renderResult(state.result);
  populateFileSelect();
  updateDatasetStatus();
});
el.fileSelect.addEventListener("change", () => {
  setActiveIndex(Number(el.fileSelect.value));
});
el.projectList.addEventListener("click", (event) => {
  const deleteButton = event.target.closest?.("[data-delete-project]");
  if (deleteButton) {
    deleteProject(Number(deleteButton.dataset.deleteProject));
    return;
  }
  const projectButton = event.target.closest?.("[data-select-project]");
  if (projectButton) setActiveIndex(Number(projectButton.dataset.selectProject));
});
el.gridSizeInput.addEventListener("change", () => {
  updateDrtGridForActiveProject();
});
el.addDrtRegionBtn.addEventListener("click", () => {
  addDrtRegion();
});
el.drtRegionList.addEventListener("input", (event) => {
  updateDrtRegionFromInput(event.target);
});
el.drtRegionList.addEventListener("click", (event) => {
  const button = event.target.closest?.("[data-delete-region]");
  if (button) deleteDrtRegion(Number(button.dataset.deleteRegion));
});
el.lambdaModeSelect.addEventListener("change", () => {
  el.manualLambdaField.hidden = el.lambdaModeSelect.value !== "manual";
});
el.analysisModeSelect.addEventListener("change", redrawCharts);
el.fixRsInput.addEventListener("change", () => {
  el.rsValueField.hidden = !el.fixRsInput.checked;
});
el.rsValueInput.addEventListener("input", () => {
  if (state.result) renderFittingParameters(state.result);
});
el.refitBtn.addEventListener("click", () => {
  refitActiveDataset();
});
el.addCircuitElementBtn.addEventListener("click", addCircuitElement);
el.removeCircuitElementBtn.addEventListener("click", removeSelectedCircuitElement);
el.resetCircuitBtn.addEventListener("click", resetCircuitBuilder);
el.circuitElementList.addEventListener("change", syncCircuitBuilderControls);
el.graphStyleSelect.addEventListener("change", () => {
  applyGraphStyle(el.graphStyleSelect.value, true);
  redrawCharts();
});
el.showDataInput.addEventListener("change", () => {
  state.showData = el.showDataInput.checked;
  updateActiveGraphSetting("showData", state.showData);
  savePreference("auto-drt-show-data", state.showData ? "1" : "0");
  redrawCharts();
});
el.showFitInput.addEventListener("change", () => {
  state.showFit = el.showFitInput.checked;
  updateActiveGraphSetting("showFit", state.showFit);
  savePreference("auto-drt-show-fit", state.showFit ? "1" : "0");
  redrawCharts();
});
el.showDrtInput.addEventListener("change", () => {
  state.showDrt = el.showDrtInput.checked;
  updateActiveGraphSetting("showDrt", state.showDrt);
  savePreference("auto-drt-show-drt", state.showDrt ? "1" : "0");
  redrawCharts();
});
el.dataColorInput.addEventListener("input", () => setProjectColor(el.dataColorInput.value));
el.fitColorInput.addEventListener("input", () => setGraphColor("fitColor", "auto-drt-fit-color", el.fitColorInput.value));
el.pointColorInput.addEventListener("input", () => setGraphColor("pointColor", "auto-drt-point-color", el.pointColorInput.value));
el.pointShapeSelect.addEventListener("change", () => {
  state.pointShape = getAllowedPointShape(el.pointShapeSelect.value);
  updateActiveGraphSetting("pointShape", state.pointShape);
  el.pointShapeSelect.value = state.pointShape;
  savePreference("auto-drt-point-shape", state.pointShape);
  redrawCharts();
});
el.labelSizeInput.addEventListener("input", () => {
  setProjectLabelSize(Number(el.labelSizeInput.value));
});
el.pointSizeInput.addEventListener("input", () => {
  setProjectPointSize(Number(el.pointSizeInput.value));
});
el.peakSensitivitySelect.addEventListener("change", () => {
  state.peakSensitivity = getAllowedPeakSensitivity(el.peakSensitivitySelect.value);
  updateActiveGraphSetting("peakSensitivity", state.peakSensitivity);
  el.peakSensitivitySelect.value = state.peakSensitivity;
  savePreference("auto-drt-peak-sensitivity", state.peakSensitivity);
  refreshDetectedPeaks(false);
});
el.detectPeaksBtn.addEventListener("click", () => {
  refreshDetectedPeaks(true);
});
el.showPeaksInput.addEventListener("change", () => {
  state.showPeaks = el.showPeaksInput.checked;
  updateActiveGraphSetting("showPeaks", state.showPeaks);
  savePreference("auto-drt-show-peaks", state.showPeaks ? "1" : "0");
  if (el.showPeaksProjectInput) el.showPeaksProjectInput.checked = state.showPeaks;
  redrawCharts();
});
el.showPeaksProjectInput?.addEventListener("change", () => {
  state.showPeaks = el.showPeaksProjectInput.checked;
  updateActiveGraphSetting("showPeaks", state.showPeaks);
  savePreference("auto-drt-show-peaks", state.showPeaks ? "1" : "0");
  el.showPeaksInput.checked = state.showPeaks;
  redrawCharts();
});
document.addEventListener("dblclick", (event) => {
  const hitZone = event.target.closest?.(".axis-hit-zone");
  const svg = event.target.closest?.("svg.chart");
  const chartKey = hitZone?.dataset.chart || svg?.dataset.chartKey;
  const axis = hitZone?.dataset.axis || getAxisFromSvgEvent(svg, event);
  if (!chartKey || !axis) return;
  event.preventDefault();
  openAxisRangeDialog(chartKey, axis);
});
document.addEventListener("pointerdown", startLegendDrag);
document.addEventListener("pointermove", moveLegendDrag);
document.addEventListener("pointerup", stopLegendDrag);
document.addEventListener("pointercancel", stopLegendDrag);
el.drtChart.addEventListener("contextmenu", openDrtPeakContextMenu);
document.addEventListener("click", closeDrtPeakContextMenu);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeDrtPeakContextMenu();
});
el.peaksTableBody.addEventListener("dblclick", renamePeakFromTable);
el.axisRangeAutoInput.addEventListener("change", syncAxisRangeDialogInputs);
el.axisExpressionSelect.addEventListener("change", syncAxisExpressionDialogInputs);
el.axisRangeCloseBtn.addEventListener("click", closeAxisRangeDialog);
el.axisRangeApplyBtn.addEventListener("click", applyAxisRangeDialog);
el.axisRangeResetBtn.addEventListener("click", resetAxisRangeDialog);
el.analyzeBtn.addEventListener("click", analyzeActiveDataset);
el.exportExcelBtn.addEventListener("click", exportDrtExcel);
el.exportFitDataBtn?.addEventListener("click", exportFitDataExcel);
el.figureSaveButtons.forEach((button) => {
  button.addEventListener("click", () => openFigureSaveDialog(button.dataset.chartKey));
});
el.figureSaveCloseBtn.addEventListener("click", closeFigureSaveDialog);
el.figureSaveCancelBtn.addEventListener("click", closeFigureSaveDialog);
el.figureSaveApplyBtn.addEventListener("click", saveSelectedFigure);
el.languageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyLanguage(button.dataset.lang);
    if (state.result) {
      renderResult(state.result);
      setStatus(`${getProjectName(state.result.dataset)} ${t("statusAnalyzed")}`);
    } else {
      updateDatasetStatus();
      renderActiveProject();
    }
  });
});

document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.remove("active"));
    button.classList.add("active");
    document.getElementById(`${button.dataset.tab}Panel`).classList.add("active");
  });
});

function getInitialLanguage() {
  try {
    const saved = localStorage.getItem("auto-drt-language");
    if (["en", "ja", "zh"].includes(saved)) return saved;
  } catch {
    // Ignore storage access limits on local files.
  }
  const locale = (navigator.language || "en").toLowerCase();
  if (locale.startsWith("ja")) return "ja";
  if (locale.startsWith("zh")) return "zh";
  return "en";
}

function getInitialPreference(key, fallback, allowedValues) {
  try {
    const saved = localStorage.getItem(key);
    if (allowedValues.includes(saved)) return saved;
  } catch {
    // Ignore storage access limits on local files.
  }
  return fallback;
}

function getInitialBool(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    if (saved === "1") return true;
    if (saved === "0") return false;
  } catch {
    // Ignore storage access limits on local files.
  }
  return fallback;
}

function getInitialNumber(key, fallback, min, max) {
  try {
    const saved = Number(localStorage.getItem(key));
    if (Number.isFinite(saved)) return clamp(saved, min, max);
  } catch {
    // Ignore storage access limits on local files.
  }
  return fallback;
}

function getInitialColor(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    if (isHexColor(saved)) return saved;
  } catch {
    // Ignore storage access limits on local files.
  }
  return fallback;
}

function savePreference(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Local storage may be unavailable for some file:// policies.
  }
}

function defaultDrtRegions() {
  return [
    { id: "low", name: "Low frequency", lowerHz: "", upperHz: "10" },
    { id: "mid", name: "Intermediate frequency", lowerHz: "10", upperHz: "10000" },
    { id: "high", name: "High frequency", lowerHz: "10000", upperHz: "" }
  ];
}

function createProjectId() {
  return `project-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function projectColor(index) {
  const colors = ["#111827", "#0f766e", "#2563eb", "#b45309", "#7c3aed", "#be123c", "#047857", "#9333ea"];
  return colors[index % colors.length];
}

function defaultProjectGraphSettings(index = state.datasets.length) {
  const preset = graphStylePresets[state.graphStyle] || graphStylePresets.journal;
  const color = projectColor(index);
  return {
    graphStyle: state.graphStyle,
    showData: true,
    showFit: true,
    showDrt: true,
    showPeaks: false,
    dataColor: color,
    fitColor: preset.fit,
    pointColor: preset.peak,
    pointShape: getAllowedPointShape(state.pointShape),
    pointSize: getInitialNumber("auto-drt-point-size", 4, 2, 12),
    labelSize: getInitialNumber("auto-drt-label-size", 12, 8, 20),
    peakSensitivity: getAllowedPeakSensitivity(state.peakSensitivity)
  };
}

function ensureProject(dataset, index = state.datasets.indexOf(dataset)) {
  if (!dataset) return null;
  if (!dataset.id) dataset.id = createProjectId();
  if (!dataset.sourceName) dataset.sourceName = dataset.originalName || dataset.name;
  if (!dataset.rawEisData) dataset.rawEisData = dataset.points;
  if (!dataset.graphSettings) dataset.graphSettings = defaultProjectGraphSettings(index >= 0 ? index : 0);
  dataset.graphSettings.pointShape = getAllowedPointShape(dataset.graphSettings.pointShape);
  dataset.graphSettings.pointSize = clamp(Number(dataset.graphSettings.pointSize) || 4, 2, 12);
  dataset.graphSettings.labelSize = clamp(Number(dataset.graphSettings.labelSize) || 12, 8, 20);
  dataset.graphSettings.peakSensitivity = getAllowedPeakSensitivity(dataset.graphSettings.peakSensitivity);
  if (!Number.isFinite(Number(dataset.drtGridSize))) dataset.drtGridSize = Number(el.gridSizeInput?.value) || 80;
  return dataset;
}

function getActiveGraphSettings(dataset = getActiveDataset()) {
  return ensureProject(dataset)?.graphSettings || defaultProjectGraphSettings();
}

function syncStateFromGraphSettings(dataset = getActiveDataset()) {
  const settings = getActiveGraphSettings(dataset);
  state.graphStyle = graphStylePresets[settings.graphStyle] ? settings.graphStyle : state.graphStyle;
  state.showData = settings.showData !== false;
  state.showFit = settings.showFit !== false;
  state.showDrt = settings.showDrt !== false;
  state.showPeaks = settings.showPeaks === true;
  state.dataColor = isHexColor(settings.dataColor) ? settings.dataColor : "";
  state.fitColor = isHexColor(settings.fitColor) ? settings.fitColor : "";
  state.pointColor = isHexColor(settings.pointColor) ? settings.pointColor : "";
  state.drtLineColor = state.dataColor;
  state.pointShape = getAllowedPointShape(settings.pointShape);
  state.pointSize = clamp(Number(settings.pointSize) || 4, 2, 12);
  state.labelSize = clamp(Number(settings.labelSize) || 12, 8, 20);
  state.peakSensitivity = getAllowedPeakSensitivity(settings.peakSensitivity);
}

function updateActiveGraphSetting(key, value) {
  const dataset = getActiveDataset();
  if (!dataset) return;
  const settings = getActiveGraphSettings(dataset);
  settings[key] = value;
  syncStateFromGraphSettings(dataset);
  syncGraphControls();
}

function setDrtAxis(axis) {
  const nextAxis = ["frequency", "f", "tau", "relaxation"].includes(axis) ? axis : "frequency";
  if (state.drtAxis !== nextAxis) clearAxisRange("drt", "x");
  state.drtAxis = nextAxis;
  savePreference("auto-drt-axis", state.drtAxis);
}

function applyGraphStyle(style, resetColors = false) {
  state.graphStyle = graphStylePresets[style] ? style : "journal";
  const dataset = getActiveDataset();
  const activeSettings = dataset ? getActiveGraphSettings(dataset) : null;
  if (resetColors) {
    const preset = graphStylePresets[state.graphStyle];
    state.dataColor = preset.data;
    state.fitColor = preset.fit;
    state.drtLineColor = preset.gamma;
    state.pointColor = preset.peak;
    if (activeSettings) {
      activeSettings.dataColor = state.dataColor;
      activeSettings.fitColor = state.fitColor;
      activeSettings.pointColor = state.pointColor;
    }
    savePreference("auto-drt-data-color", state.dataColor);
    savePreference("auto-drt-fit-color", state.fitColor);
    savePreference("auto-drt-line-color", state.drtLineColor);
    savePreference("auto-drt-point-color", state.pointColor);
  }
  if (activeSettings) activeSettings.graphStyle = state.graphStyle;
  el.body.dataset.graphStyle = state.graphStyle;
  el.graphStyleSelect.value = state.graphStyle;
  savePreference("auto-drt-graph-style", state.graphStyle);
  syncGraphControls();
}

function syncGraphControls() {
  const preset = graphStylePresets[state.graphStyle] || graphStylePresets.journal;
  const pointSize = getProjectPointSize();
  const labelSize = getProjectLabelSize();
  el.showDataInput.checked = state.showData;
  el.showFitInput.checked = state.showFit;
  el.showDrtInput.checked = state.showDrt;
  el.showPeaksInput.checked = state.showPeaks;
  if (el.showPeaksProjectInput) el.showPeaksProjectInput.checked = state.showPeaks;
  el.dataColorInput.value = state.dataColor || preset.data;
  el.fitColorInput.value = state.fitColor || preset.fit;
  el.pointColorInput.value = state.pointColor || preset.peak;
  el.pointShapeSelect.value = state.pointShape;
  el.pointSizeInput.value = String(pointSize);
  el.pointSizeValue.textContent = formatSliderValue(pointSize);
  el.labelSizeInput.value = String(labelSize);
  el.labelSizeValue.textContent = String(Math.round(labelSize));
  el.peakSensitivitySelect.value = state.peakSensitivity;
}

function setProjectColor(value) {
  if (!isHexColor(value)) return;
  updateActiveGraphSetting("dataColor", value);
  state.dataColor = value;
  state.drtLineColor = value;
  savePreference("auto-drt-data-color", value);
  savePreference("auto-drt-line-color", value);
  redrawCharts();
}

function setGraphColor(stateKey, storageKey, value) {
  if (!isHexColor(value)) return;
  updateActiveGraphSetting(stateKey, value);
  state[stateKey] = value;
  savePreference(storageKey, value);
  redrawCharts();
}

function getProjectPointSize(dataset = getActiveDataset()) {
  const value = Number(dataset?.graphSettings?.pointSize ?? dataset?.pointSize ?? state.pointSize);
  return clamp(Number.isFinite(value) ? value : 4, 2, 12);
}

function getProjectLabelSize(dataset = getActiveDataset()) {
  const value = Number(dataset?.graphSettings?.labelSize ?? dataset?.labelSize ?? state.labelSize);
  return clamp(Number.isFinite(value) ? value : 12, 8, 20);
}

function setProjectPointSize(value) {
  const next = clamp(Number.isFinite(value) ? value : 4, 2, 12);
  state.pointSize = next;
  const dataset = getActiveDataset();
  if (dataset) {
    dataset.pointSize = next;
    getActiveGraphSettings(dataset).pointSize = next;
  }
  savePreference("auto-drt-point-size", String(next));
  el.pointSizeInput.value = String(next);
  el.pointSizeValue.textContent = formatSliderValue(next);
  redrawCharts();
}

function setProjectLabelSize(value) {
  const next = clamp(Number.isFinite(value) ? value : 12, 8, 20);
  state.labelSize = next;
  const dataset = getActiveDataset();
  if (dataset) {
    dataset.labelSize = next;
    getActiveGraphSettings(dataset).labelSize = next;
  }
  savePreference("auto-drt-label-size", String(next));
  el.labelSizeInput.value = String(next);
  el.labelSizeValue.textContent = String(Math.round(next));
  redrawCharts();
}

function formatSliderValue(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function redrawCharts() {
  if (state.result) {
    renderResult(state.result);
  } else {
    renderNoActiveResult();
  }
}

function getAllowedPointShape(shape) {
  return ["circle", "square", "triangle", "diamond", "cross"].includes(shape) ? shape : "circle";
}

function getAllowedPeakSensitivity(value) {
  return ["low", "normal", "high"].includes(value) ? value : "normal";
}

function isHexColor(value) {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}

function createAxisRangeState() {
  return {
    nyquist: { x: null, y: null },
    bodeMagnitude: { x: null, y: null },
    bodePhase: { x: null, y: null },
    drt: { x: null, y: null },
    residual: { x: null, y: null }
  };
}

function resetAxisRanges() {
  state.axisRanges = createAxisRangeState();
  state.lastChartDomains = {};
}

function clearAxisRange(chartKey, axis) {
  if (state.axisRanges[chartKey]) state.axisRanges[chartKey][axis] = null;
}

function clearEisAxisRanges() {
  ["nyquist", "bodeMagnitude", "residual"].forEach((chartKey) => {
    if (!state.axisRanges[chartKey]) return;
    state.axisRanges[chartKey].x = null;
    state.axisRanges[chartKey].y = null;
  });
}

function convertEisAxisRanges(oldScale, newScale) {
  if (!Number.isFinite(oldScale) || !Number.isFinite(newScale) || oldScale <= 0 || newScale <= 0) return;
  const ratio = newScale / oldScale;
  if (!Number.isFinite(ratio) || Math.abs(ratio - 1) < 1e-12) return;
  [
    ["nyquist", "x"],
    ["nyquist", "y"],
    ["bodeMagnitude", "y"],
    ["residual", "y"]
  ].forEach(([chartKey, axis]) => {
    const range = state.axisRanges[chartKey]?.[axis];
    if (!range) return;
    state.axisRanges[chartKey][axis] = {
      min: range.min * ratio,
      max: range.max * ratio
    };
  });
}

function convertAxisRangeScale(chartKey, axis, oldScale, newScale) {
  if (!Number.isFinite(oldScale) || !Number.isFinite(newScale) || oldScale <= 0 || newScale <= 0) return;
  const ratio = newScale / oldScale;
  if (!Number.isFinite(ratio) || Math.abs(ratio - 1) < 1e-12) return;
  const range = state.axisRanges[chartKey]?.[axis];
  if (!range) return;
  state.axisRanges[chartKey][axis] = {
    min: range.min * ratio,
    max: range.max * ratio
  };
}

function resolveAxisDomain(chartKey, axis, autoDomain, scaleType) {
  const range = state.axisRanges[chartKey]?.[axis];
  if (!range) return autoDomain;
  if (!isValidAxisRange(range.min, range.max, scaleType)) return autoDomain;
  return [range.min, range.max];
}

function isValidAxisRange(min, max, scaleType) {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max) return false;
  return scaleType !== "log" || (min > 0 && max > 0);
}

function rememberChartDomain(chartKey, metadata) {
  if (!chartKey) return;
  state.lastChartDomains[chartKey] = metadata;
}

function getImpedanceUnit(dataset = getActiveDataset()) {
  return dataset?.impedanceUnit === "area" ? "area" : "ohm";
}

function getElectrodeArea(dataset = getActiveDataset()) {
  const area = Number(dataset?.electrodeArea);
  return Number.isFinite(area) && area > 0 ? area : 1;
}

function getEffectiveElectrodeArea(dataset = getActiveDataset()) {
  return getElectrodeArea(dataset);
}

function hasValidElectrodeArea(dataset = getActiveDataset()) {
  const area = Number(dataset?.electrodeArea);
  return Number.isFinite(area) && area > 0;
}

function getElectrodeAreaSource(dataset = getActiveDataset()) {
  if (!hasValidElectrodeArea(dataset)) return "default 1";
  return dataset?.electrodeAreaSource === "default" ? "default 1" : "user input";
}

function setElectrodeAreaFromInput(dataset, value) {
  if (!dataset) return;
  const area = Number(value);
  if (Number.isFinite(area) && area > 0) {
    dataset.electrodeArea = area;
    dataset.electrodeAreaSource = "user";
    return;
  }
  dataset.electrodeArea = 1;
  dataset.electrodeAreaSource = "default";
}

function labelUsesArea(label) {
  return typeof label === "string" && label.includes("Ω cm²");
}

function scaleForAxisLabel(dataset, axisLabel) {
  return labelUsesArea(axisLabel) ? getEffectiveElectrodeArea(dataset) : 1;
}

function applyAreaIfNeeded(values, axisLabel, dataset = getActiveDataset()) {
  const factor = scaleForAxisLabel(dataset, axisLabel);
  return values.map((value) => value * factor);
}

function isEisAreaNormalizationEnabled() {
  return [zRealLabel(), zNegImagLabel(), magnitudeLabel()].some(labelUsesArea);
}

function isDrtAreaNormalizationEnabled(expression = state.drtYAxisExpression) {
  return drtYAxisUsesArea(expression) || labelUsesArea(areaAwareDrtLabel(expression));
}

function isAnyAreaNormalizationEnabled(dataset = getActiveDataset()) {
  return isEisAreaNormalizationEnabled(dataset) || isDrtAreaNormalizationEnabled();
}

function resetAreaNormalizationDefaults(datasets = state.datasets) {
  const list = Array.isArray(datasets) ? datasets : [datasets].filter(Boolean);
  list.forEach((dataset) => {
    dataset.impedanceUnit = "ohm";
    dataset.electrodeArea = null;
    dataset.electrodeAreaSource = "default";
  });
  state.drtAxis = "frequency";
  state.drtYAxisExpression = "gamma_f";
  state.bodePhaseExpression = "phase";
  state.nyquistXLabel = "zprime";
  state.nyquistYLabel = "neg_zdoubleprime";
  state.bodeMagnitudeYLabel = "abs_z";
  savePreference("auto-drt-axis", state.drtAxis);
  savePreference("auto-drt-y-expression", state.drtYAxisExpression);
  savePreference("auto-bode-phase-expression", state.bodePhaseExpression);
  savePreference("auto-nyquist-x-label", state.nyquistXLabel);
  savePreference("auto-nyquist-y-label", state.nyquistYLabel);
  savePreference("auto-bode-mag-y-label", state.bodeMagnitudeYLabel);
}

function displayScale(dataset = getActiveDataset()) {
  return isEisAreaNormalizationEnabled() ? getEffectiveElectrodeArea(dataset) : 1;
}

function impedanceUnitText() {
  return isEisAreaNormalizationEnabled() ? "Ω cm²" : "Ω";
}

function impedanceUnitSlug() {
  return isEisAreaNormalizationEnabled() ? "ohm_cm2" : "ohm";
}

function zRealLabel() {
  return eisAxisLabelForUnit("nyquist", "x", getImpedanceUnit());
}

function zNegImagLabel() {
  return eisAxisLabelForUnit("nyquist", "y", getImpedanceUnit());
}

function magnitudeLabel() {
  return eisAxisLabelForUnit("bodeMagnitude", "y", getImpedanceUnit());
}

function residualLabel() {
  return isEisAreaNormalizationEnabled() ? "Residual / Ω cm²" : "Residual / Ω";
}

function drtYLabel() {
  if (state.drtYAxisExpression === "gamma_f_area") return t("gammaFArea");
  if (state.drtYAxisExpression === "gamma_tau_area") return t("gammaTauArea");
  if (state.drtYAxisExpression === "drtg_f_area") return t("drtgFArea");
  if (state.drtYAxisExpression === "gamma_tau") return t("gammaTau");
  if (state.drtYAxisExpression === "drtg_f") return t("drtgF");
  return t("gammaF");
}

function drtYAxisUsesArea(expression = state.drtYAxisExpression) {
  return String(expression || "").endsWith("_area");
}

function drtDisplayScale(dataset = getActiveDataset()) {
  return drtYAxisUsesArea() ? getElectrodeArea(dataset) : 1;
}

function drtYAxisUnitText() {
  return drtYAxisUsesArea() ? "Ω cm²" : "Ω";
}

function drtXAxisLabel() {
  if (state.drtAxis === "f") return t("fHzShort");
  if (state.drtAxis === "tau") return t("tauS");
  if (state.drtAxis === "relaxation") return t("relaxationTime");
  return t("frequencyHz");
}

function drtXAxisMode(axis = state.drtAxis) {
  return axis === "tau" || axis === "relaxation" ? "tau" : "frequency";
}

function phaseLabel() {
  if (state.bodePhaseExpression === "neg_theta") return t("negativeThetaDegree");
  if (state.bodePhaseExpression === "neg_phase_angle") return t("negativePhaseAngleDegree");
  if (state.bodePhaseExpression === "neg_phase") return t("negativePhaseDeg");
  if (state.bodePhaseExpression === "theta") return t("thetaDegree");
  if (state.bodePhaseExpression === "phase_angle") return t("phaseAngleDegree");
  return t("phaseDegShort");
}

function isNegativePhaseExpression(expression = state.bodePhaseExpression) {
  return ["neg_phase", "neg_theta", "neg_phase_angle"].includes(expression);
}

function phaseDisplayMode() {
  return isNegativePhaseExpression() ? "negative phase" : "raw phase";
}

function phaseDisplayValue(point) {
  const phase = -Math.atan2(point.zNegImag, point.zReal) * 180 / Math.PI;
  return isNegativePhaseExpression() ? -phase : phase;
}

function openAxisRangeDialog(chartKey, axis) {
  if (!chartKey || !axis || !state.lastChartDomains[chartKey]) return;
  const metadata = state.lastChartDomains[chartKey];
  const currentRange = state.axisRanges[chartKey]?.[axis];
  const domain = currentRange ? [currentRange.min, currentRange.max] : (axis === "x" ? metadata.xDomain : metadata.yDomain);
  const label = axis === "x" ? metadata.xLabel : metadata.yLabel;
  state.axisDialog = { chartKey, axis };
  document.getElementById("axisRangeHeading").textContent = t(axis === "x" ? "xAxisSettings" : "yAxisSettings");
  el.axisRangeChartLabel.textContent = `${chartDisplayName(chartKey)} | ${label}`;
  el.axisRangeAutoInput.checked = !currentRange;
  el.axisRangeMinInput.value = formatRangeInput(domain[0]);
  el.axisRangeMaxInput.value = formatRangeInput(domain[1]);
  el.axisRangeError.hidden = true;
  populateAxisExpressionOptions();
  syncAxisRangeDialogInputs();
  syncAxisExpressionDialogInputs();
  if (typeof el.axisRangeDialog.showModal === "function") {
    el.axisRangeDialog.showModal();
  } else {
    el.axisRangeDialog.setAttribute("open", "");
  }
}

function closeAxisRangeDialog() {
  if (typeof el.axisRangeDialog.close === "function") {
    el.axisRangeDialog.close();
  } else {
    el.axisRangeDialog.removeAttribute("open");
  }
}

function syncAxisRangeDialogInputs() {
  const isAuto = el.axisRangeAutoInput.checked;
  el.axisRangeMinInput.disabled = isAuto;
  el.axisRangeMaxInput.disabled = isAuto;
}

function axisExpressionOptions(chartKey = state.axisDialog.chartKey, axis = state.axisDialog.axis) {
  if (isEisImpedanceAxis(chartKey, axis)) {
    return eisAxisLabelTemplates(chartKey, axis)
      .flatMap((template) => [
        { value: `${template.value}|ohm`, label: templateLabelWithUnit(template.label, "ohm") },
        { value: `${template.value}|area`, label: templateLabelWithUnit(template.label, "area") }
      ]);
  }
  if (chartKey === "drt" && axis === "x") {
    return [
      { value: "frequency", label: t("axisFrequency") },
      { value: "f", label: t("fHzShort") },
      { value: "tau", label: t("tauS") },
      { value: "relaxation", label: t("relaxationTime") }
    ];
  }
  if (chartKey === "drt" && axis === "y") {
    return [
      { value: "gamma_f", label: areaAwareDrtLabel("gamma_f") },
      { value: "gamma_tau", label: areaAwareDrtLabel("gamma_tau") },
      { value: "drtg_f", label: areaAwareDrtLabel("drtg_f") },
      { value: "gamma_f_area", label: areaAwareDrtLabel("gamma_f_area") },
      { value: "gamma_tau_area", label: areaAwareDrtLabel("gamma_tau_area") },
      { value: "drtg_f_area", label: areaAwareDrtLabel("drtg_f_area") }
    ];
  }
  if (chartKey === "bodePhase" && axis === "y") {
    return [
      { value: "phase", label: t("phaseDegShort") },
      { value: "theta", label: t("thetaDegree") },
      { value: "phase_angle", label: t("phaseAngleDegree") },
      { value: "neg_phase", label: t("negativePhaseDeg") },
      { value: "neg_theta", label: t("negativeThetaDegree") },
      { value: "neg_phase_angle", label: t("negativePhaseAngleDegree") }
    ];
  }
  return [];
}

function isEisImpedanceAxis(chartKey, axis) {
  return (chartKey === "nyquist" && (axis === "x" || axis === "y"))
    || (chartKey === "bodeMagnitude" && axis === "y");
}

function eisAxisLabelTemplates(chartKey, axis) {
  if (chartKey === "nyquist" && axis === "x") {
    return [
      { value: "zprime", label: "Z'" },
      { value: "zre", label: "Zre" },
      { value: "re_z", label: "Re(Z)" }
    ];
  }
  if (chartKey === "nyquist" && axis === "y") {
    return [
      { value: "neg_zdoubleprime", label: "-Z''" },
      { value: "neg_zim", label: "-Zim" },
      { value: "neg_im_z", label: "-Im(Z)" }
    ];
  }
  return [
    { value: "abs_z", label: "|Z|" },
    { value: "mod_z", label: "Mod(Z)" },
    { value: "impedance", label: "Impedance" }
  ];
}

function templateLabelWithUnit(label, unit) {
  return `${label} / ${unit === "area" ? "Ω cm²" : "Ω"}`;
}

function eisAxisLabelForUnit(chartKey, axis, unit) {
  const templateValue = currentEisAxisTemplate(chartKey, axis);
  const template = eisAxisLabelTemplates(chartKey, axis).find((item) => item.value === templateValue)
    || eisAxisLabelTemplates(chartKey, axis)[0];
  return templateLabelWithUnit(template.label, unit);
}

function currentEisAxisTemplate(chartKey, axis) {
  if (chartKey === "nyquist" && axis === "x") return state.nyquistXLabel;
  if (chartKey === "nyquist" && axis === "y") return state.nyquistYLabel;
  return state.bodeMagnitudeYLabel;
}

function setEisAxisTemplate(chartKey, axis, value) {
  const allowed = eisAxisLabelTemplates(chartKey, axis).map((item) => item.value);
  const next = allowed.includes(value) ? value : allowed[0];
  if (chartKey === "nyquist" && axis === "x") {
    state.nyquistXLabel = next;
    savePreference("auto-nyquist-x-label", next);
    return;
  }
  if (chartKey === "nyquist" && axis === "y") {
    state.nyquistYLabel = next;
    savePreference("auto-nyquist-y-label", next);
    return;
  }
  state.bodeMagnitudeYLabel = next;
  savePreference("auto-bode-mag-y-label", next);
}

function parseEisAxisValue(value) {
  const [template = "", unit = "ohm"] = String(value || "").split("|");
  return {
    template,
    unit: unit === "area" ? "area" : "ohm"
  };
}

function makeEisAxisValue(chartKey, axis, unit = getImpedanceUnit()) {
  return `${currentEisAxisTemplate(chartKey, axis)}|${unit === "area" ? "area" : "ohm"}`;
}

function areaAwareDrtLabel(expression) {
  if (expression === "gamma_f_area") return t("gammaFArea");
  if (expression === "gamma_tau_area") return t("gammaTauArea");
  if (expression === "drtg_f_area") return t("drtgFArea");
  if (expression === "drtg_f") return t("drtgF");
  if (expression === "gamma_tau") return t("gammaTau");
  return t("gammaF");
}

function currentAxisExpression(chartKey = state.axisDialog.chartKey, axis = state.axisDialog.axis) {
  if (isEisImpedanceAxis(chartKey, axis)) return makeEisAxisValue(chartKey, axis, getImpedanceUnit());
  if (chartKey === "drt" && axis === "x") return state.drtAxis;
  if (chartKey === "drt" && axis === "y") return state.drtYAxisExpression;
  if (chartKey === "bodePhase" && axis === "y") return state.bodePhaseExpression;
  return "";
}

function populateAxisExpressionOptions() {
  const options = axisExpressionOptions();
  el.axisExpressionSelect.innerHTML = "";
  if (!options.length) {
    el.axisExpressionField.hidden = true;
    el.electrodeAreaField.hidden = true;
    return;
  }
  options.forEach((option) => {
    const node = document.createElement("option");
    node.value = option.value;
    node.textContent = option.label;
    el.axisExpressionSelect.appendChild(node);
  });
  el.axisExpressionSelect.value = currentAxisExpression();
  el.axisExpressionField.hidden = false;
}

function syncAxisExpressionDialogInputs() {
  const { chartKey, axis } = state.axisDialog;
  const isEisArea = isEisImpedanceAxis(chartKey, axis) && parseEisAxisValue(el.axisExpressionSelect.value).unit === "area";
  const isDrtArea = chartKey === "drt" && axis === "y" && drtYAxisUsesArea(el.axisExpressionSelect.value);
  const selectedLabel = el.axisExpressionSelect.selectedOptions?.[0]?.textContent || "";
  const showsArea = isEisArea || isDrtArea || labelUsesArea(selectedLabel);
  el.electrodeAreaField.hidden = !showsArea;
  const dataset = getActiveDataset();
  if (showsArea && document.activeElement !== el.electrodeAreaInput) {
    const savedArea = Number(dataset?.electrodeArea);
    el.electrodeAreaInput.value = Number.isFinite(savedArea) && savedArea > 0 ? String(savedArea) : "";
  }
}

function applyAxisRangeDialog() {
  const { chartKey, axis } = state.axisDialog;
  const metadata = state.lastChartDomains[chartKey];
  if (!metadata) return;
  const expressionResult = applyAxisExpressionSettings(chartKey, axis);
  if (!expressionResult.ok) return;
  if (el.axisRangeAutoInput.checked) {
    clearAxisRange(chartKey, axis);
    closeAxisRangeDialog();
    redrawCharts();
    return;
  }
  const min = Number(el.axisRangeMinInput.value);
  const max = Number(el.axisRangeMaxInput.value);
  const scaleType = axis === "x" ? metadata.xScale : metadata.yScale;
  if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max) {
    showAxisRangeError(t("invalidRange"));
    return;
  }
  if (scaleType === "log" && (min <= 0 || max <= 0)) {
    showAxisRangeError(t("positiveRange"));
    return;
  }
  if (!state.axisRanges[chartKey]) state.axisRanges[chartKey] = { x: null, y: null };
  state.axisRanges[chartKey][axis] = { min, max };
  closeAxisRangeDialog();
  redrawCharts();
}

function applyAxisExpressionSettings(chartKey, axis) {
  const options = axisExpressionOptions(chartKey, axis);
  if (!options.length || el.axisExpressionField.hidden) return { ok: true, resetRanges: false };
  const value = el.axisExpressionSelect.value;
  let resetRanges = false;
  if (isEisImpedanceAxis(chartKey, axis)) {
    const dataset = getActiveDataset();
    if (!dataset) return { ok: true, resetRanges: false };
    const parsed = parseEisAxisValue(value);
    const wantsArea = parsed.unit === "area";
    const oldScale = displayScale(dataset);
    const oldUnit = getImpedanceUnit(dataset);
    const oldArea = getElectrodeArea(dataset);
    setEisAxisTemplate(chartKey, axis, parsed.template);
    if (wantsArea) {
      setElectrodeAreaFromInput(dataset, el.electrodeAreaInput.value);
      dataset.impedanceUnit = "area";
    } else {
      dataset.impedanceUnit = "ohm";
    }
    const newScale = displayScale(dataset);
    if (oldUnit !== getImpedanceUnit(dataset) || oldArea !== getElectrodeArea(dataset)) {
      convertEisAxisRanges(oldScale, newScale);
      resetRanges = true;
    }
    return { ok: true, resetRanges };
  }
  if (chartKey === "drt" && axis === "x") {
    if (state.drtAxis !== value) {
      setDrtAxis(value);
      resetRanges = true;
    }
    return { ok: true, resetRanges };
  }
  if (chartKey === "drt" && axis === "y") {
    const oldScale = drtDisplayScale();
    const wantsArea = drtYAxisUsesArea(value);
    if (wantsArea) {
      const dataset = getActiveDataset();
      setElectrodeAreaFromInput(dataset, el.electrodeAreaInput.value);
    }
    if (state.drtYAxisExpression !== value) {
      state.drtYAxisExpression = value;
      savePreference("auto-drt-y-expression", value);
    }
    const newScale = drtDisplayScale();
    convertAxisRangeScale("drt", "y", oldScale, newScale);
    return { ok: true, resetRanges: false };
  }
  if (chartKey === "bodePhase" && axis === "y") {
    if (state.bodePhaseExpression !== value) {
      state.bodePhaseExpression = value;
      savePreference("auto-bode-phase-expression", value);
    }
  }
  return { ok: true, resetRanges: false };
}

function resetAxisRangeDialog() {
  const { chartKey, axis } = state.axisDialog;
  clearAxisRange(chartKey, axis);
  closeAxisRangeDialog();
  redrawCharts();
}

function showAxisRangeError(message) {
  el.axisRangeError.textContent = message;
  el.axisRangeError.hidden = false;
}

function getAxisFromSvgEvent(svg, event) {
  if (!svg) return "";
  const box = svg.getBoundingClientRect();
  if (!box.width || !box.height) return "";
  const viewWidth = Number(svg.dataset.viewWidth) || 720;
  const viewHeight = Number(svg.dataset.viewHeight) || 420;
  const x = (event.clientX - box.left) * viewWidth / box.width;
  const y = (event.clientY - box.top) * viewHeight / box.height;
  const left = Number(svg.dataset.plotLeft);
  const top = Number(svg.dataset.plotTop);
  const right = Number(svg.dataset.plotRight);
  const bottom = Number(svg.dataset.plotBottom);
  if ([left, top, right, bottom].some((value) => !Number.isFinite(value))) return "";
  if (x >= left && x <= right && y >= bottom && y <= viewHeight) return "x";
  if (x >= 0 && x <= left && y >= top && y <= bottom) return "y";
  return "";
}

function formatRangeInput(value) {
  if (!Number.isFinite(value)) return "";
  return Math.abs(value) >= 10000 || (Math.abs(value) > 0 && Math.abs(value) < 0.001)
    ? value.toExponential(6)
    : Number(value.toPrecision(8)).toString();
}

function chartDisplayName(chartKey) {
  const names = {
    nyquist: "Nyquist",
    bodeMagnitude: t("bodeMagnitude"),
    bodePhase: t("bodePhase"),
    drt: t("distribution"),
    residual: t("residual"),
    circuit: t("equivalentCircuitHeading")
  };
  return names[chartKey] || chartKey;
}

function syncCircuitControls() {
  const dataset = getActiveDataset();
  if (el.circuitElementList) el.circuitElementList.disabled = !dataset;
  if (el.addCircuitElementSelect) el.addCircuitElementSelect.disabled = !dataset;
  if (el.addCircuitElementBtn) el.addCircuitElementBtn.disabled = !dataset;
  if (el.resetCircuitBtn) el.resetCircuitBtn.disabled = !dataset;
  renderCircuitModel();
  syncCircuitBuilderControls();
}

function defaultCircuitElements() {
  return [
    { type: "rs", label: "Rs", param: "Rs" },
    { type: "r_cpe", rLabel: "R1", cpeLabel: "CPE1", rParam: "R1", qParam: "Q1", nParam: "n1" },
    { type: "r_cpe", rLabel: "R2", cpeLabel: "CPE2", rParam: "R2", qParam: "Q2", nParam: "n2" }
  ];
}

function cloneCircuitElements(elements) {
  return elements.map((element) => ({ ...element }));
}

function getCircuitElements(dataset = getActiveDataset()) {
  if (!dataset) return defaultCircuitElements();
  if (!Array.isArray(dataset.circuitElements)) {
    dataset.circuitElements = circuitElementsFromLegacyModel(dataset.circuitModel);
  }
  if (!dataset.circuitElements.length || dataset.circuitElements[0].type !== "rs") {
    dataset.circuitElements = [{ type: "rs", label: "Rs", param: "Rs" }, ...dataset.circuitElements.filter((element) => element.type !== "rs")];
  }
  dataset.circuitElements = renumberCircuitElements(dataset.circuitElements);
  return dataset.circuitElements;
}

function circuitElementsFromLegacyModel(model) {
  const elements = defaultCircuitElements();
  if (model === "rs-r1cpe1") return elements.slice(0, 2);
  if (model === "rs-r1cpe1-w") return [...elements.slice(0, 2), { type: "w", label: "W1", param: "WA1" }];
  if (model === "rs-r1cpe1-r2cpe2-w") return [...elements, { type: "w", label: "W1", param: "WA1" }];
  return elements;
}

function getCircuitModel(dataset = getActiveDataset()) {
  return circuitText(getCircuitElements(dataset));
}

function circuitText(input = getCircuitElements()) {
  if (typeof input === "string") return legacyCircuitText(input);
  const elements = circuitElementsFromInput(input);
  return elements.map(circuitElementText).join(" - ");
}

function legacyCircuitText(model) {
  if (model === "rs-r1cpe1") return "Rs - (R1 || CPE1)";
  if (model === "rs-r1cpe1-w") return "Rs - (R1 || CPE1) - W1";
  if (model === "rs-r1cpe1-r2cpe2-w") return "Rs - (R1 || CPE1) - (R2 || CPE2) - W1";
  return model || "Rs - (R1 || CPE1) - (R2 || CPE2)";
}

function circuitElementsFromInput(input) {
  if (Array.isArray(input)) return input;
  if (typeof input === "string") return circuitElementsFromLegacyModel(input);
  return getCircuitElements();
}

function circuitElementText(element) {
  if (element.type === "rs") return "Rs";
  if (element.type === "r") return element.label;
  if (element.type === "c") return element.label;
  if (element.type === "cpe") return element.cpeLabel;
  if (element.type === "r_cpe") return `(${element.rLabel} || ${element.cpeLabel})`;
  if (element.type === "r_c") return `(${element.rLabel} || ${element.cLabel})`;
  if (element.type === "r_w") return `(${element.rLabel} || ${element.wLabel})`;
  if (element.type === "cpe_w") return `(${element.cpeLabel} || ${element.wLabel})`;
  if (element.type === "r_cpe_w") return `(${element.rLabel} || ${element.cpeLabel} || ${element.wLabel})`;
  if (element.type === "w") return element.label;
  return element.label || element.type;
}

function renderCircuitModel() {
  if (!el.equivalentCircuitText || !el.circuitDiagram) return;
  const elements = getCircuitElements();
  el.equivalentCircuitText.textContent = circuitText(elements);
  drawCircuitDiagram(elements);
  renderCircuitElementList(elements);
}

function drawCircuitDiagram(input = getCircuitElements()) {
  const svg = el.circuitDiagram;
  if (!svg) return;
  clearSvg(svg);
  const elements = circuitElementsFromInput(input);
  const width = Math.max(460, 120 + elements.length * 170);
  const height = 160;
  const midY = 80;
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.style.width = "";

  let x = 26;
  svg.appendChild(svgEl("line", { x1: x, x2: x + 28, y1: midY, y2: midY, class: "circuit-wire" }));
  x += 28;
  elements.forEach((element) => {
    const branches = circuitElementBranches(element);
    if (branches.length > 1) {
      x = drawParallelGroup(svg, x, midY, branches);
      return;
    }
    x = drawSeriesBlock(svg, x, midY, element.label || circuitElementText(element), element.type === "rs" ? 54 : 58);
  });
  svg.appendChild(svgEl("line", { x1: x, x2: width - 26, y1: midY, y2: midY, class: "circuit-wire" }));
}

function drawSeriesBlock(svg, x, y, label, blockWidth = 54) {
  const lead = 14;
  svg.appendChild(svgEl("line", { x1: x, x2: x + lead, y1: y, y2: y, class: "circuit-wire" }));
  svg.appendChild(svgEl("rect", { x: x + lead, y: y - 14, width: blockWidth, height: 28, rx: 2, class: "circuit-element" }));
  const text = svgEl("text", { x: x + lead + blockWidth / 2, y: y + 5, "text-anchor": "middle", class: "circuit-label" });
  text.textContent = label;
  svg.appendChild(text);
  svg.appendChild(svgEl("line", { x1: x + lead + blockWidth, x2: x + lead + blockWidth + lead, y1: y, y2: y, class: "circuit-wire" }));
  return x + lead * 2 + blockWidth;
}

function circuitElementBranches(element) {
  if (element.type === "r_cpe") return [element.rLabel, element.cpeLabel];
  if (element.type === "r_c") return [element.rLabel, element.cLabel];
  if (element.type === "r_w") return [element.rLabel, element.wLabel];
  if (element.type === "cpe_w") return [element.cpeLabel, element.wLabel];
  if (element.type === "r_cpe_w") return [element.rLabel, element.cpeLabel, element.wLabel];
  return [element.label || element.cpeLabel || circuitElementText(element)];
}

function drawParallelGroup(svg, x, midY, labels) {
  const left = x + 8;
  const right = x + (labels.length > 2 ? 190 : 160);
  const ys = labels.length > 2 ? [midY - 52, midY, midY + 52] : [midY - 42, midY + 42];
  svg.appendChild(svgEl("line", { x1: x, x2: left, y1: midY, y2: midY, class: "circuit-wire" }));
  svg.appendChild(svgEl("line", { x1: left, x2: left, y1: ys[0], y2: ys[ys.length - 1], class: "circuit-wire" }));
  svg.appendChild(svgEl("line", { x1: right, x2: right, y1: ys[0], y2: ys[ys.length - 1], class: "circuit-wire" }));
  labels.forEach((label, index) => {
    drawBranchElement(svg, left, right, ys[index], label, label.length > 3 ? 70 : 52);
  });
  svg.appendChild(svgEl("line", { x1: right, x2: right + 14, y1: midY, y2: midY, class: "circuit-wire" }));
  return right + 14;
}

function drawBranchElement(svg, left, right, y, label, blockWidth) {
  const center = (left + right) / 2;
  const blockX = center - blockWidth / 2;
  svg.appendChild(svgEl("line", { x1: left, x2: blockX, y1: y, y2: y, class: "circuit-wire" }));
  svg.appendChild(svgEl("rect", { x: blockX, y: y - 13, width: blockWidth, height: 26, rx: 2, class: "circuit-element" }));
  const text = svgEl("text", { x: center, y: y + 5, "text-anchor": "middle", class: "circuit-label" });
  text.textContent = label;
  svg.appendChild(text);
  svg.appendChild(svgEl("line", { x1: blockX + blockWidth, x2: right, y1: y, y2: y, class: "circuit-wire" }));
}

function renderCircuitElementList(elements = getCircuitElements()) {
  if (!el.circuitElementList) return;
  const selected = el.circuitElementList.value;
  el.circuitElementList.innerHTML = elements.map((element, index) => `
    <option value="${index}"${index === Number(selected) ? " selected" : ""}>${index + 1}. ${escapeHtml(circuitElementText(element))}</option>
  `).join("");
  syncCircuitBuilderControls();
}

function syncCircuitBuilderControls() {
  const dataset = getActiveDataset();
  const hasDataset = !!dataset;
  const selectedIndex = Number(el.circuitElementList?.value);
  if (el.removeCircuitElementBtn) {
    el.removeCircuitElementBtn.disabled = !hasDataset || !Number.isFinite(selectedIndex);
  }
}

function addCircuitElement() {
  const dataset = getActiveDataset();
  if (!dataset) return;
  const elements = getCircuitElements(dataset);
  elements.push(createCircuitElement(el.addCircuitElementSelect.value, elements));
  dataset.circuitElements = renumberCircuitElements(elements);
  markCircuitOutdated(dataset);
}

function removeSelectedCircuitElement() {
  const dataset = getActiveDataset();
  if (!dataset) return;
  const index = Number(el.circuitElementList.value);
  if (!Number.isFinite(index)) return;
  if (index <= 0) {
    setStatus(t("rsCannotDelete"));
    if (el.fitStatusText) el.fitStatusText.textContent = t("rsCannotDelete");
    return;
  }
  const elements = getCircuitElements(dataset);
  elements.splice(index, 1);
  dataset.circuitElements = renumberCircuitElements(elements);
  markCircuitOutdated(dataset);
}

function resetCircuitBuilder() {
  const dataset = getActiveDataset();
  if (!dataset) return;
  dataset.circuitElements = defaultCircuitElements();
  markCircuitOutdated(dataset, t("circuitResetRefit"));
}

function createCircuitElement(type, elements) {
  const supported = ["r", "c", "cpe", "w", "r_c", "r_cpe", "r_w", "cpe_w", "r_cpe_w"];
  return { type: supported.includes(type) ? type : "r_cpe" };
}

function renumberCircuitElements(elements) {
  const next = [{ type: "rs", label: "Rs", param: "Rs" }];
  const counters = { r: 1, c: 1, cpe: 1, w: 1 };
  elements.filter((element) => element.type !== "rs").forEach((element) => {
    next.push(buildRenumberedElement(element.type, counters));
  });
  return next;
}

function buildRenumberedElement(type, counters) {
  if (type === "r") {
    const index = counters.r++;
    return { type, label: `R${index}`, param: `R${index}` };
  }
  if (type === "c") {
    const index = counters.c++;
    return { type, label: `C${index}`, param: `C${index}` };
  }
  if (type === "cpe") {
    const index = counters.cpe++;
    return { type, cpeLabel: `CPE${index}`, qParam: `Q${index}`, nParam: `n${index}` };
  }
  if (type === "w") {
    const index = counters.w++;
    return { type, label: `W${index}`, param: `WA${index}` };
  }
  if (type === "r_c") {
    const rIndex = counters.r++;
    const cIndex = counters.c++;
    return { type, rLabel: `R${rIndex}`, cLabel: `C${cIndex}`, rParam: `R${rIndex}`, cParam: `C${cIndex}` };
  }
  if (type === "r_w") {
    const rIndex = counters.r++;
    const wIndex = counters.w++;
    return { type, rLabel: `R${rIndex}`, wLabel: `W${wIndex}`, rParam: `R${rIndex}`, wParam: `WA${wIndex}` };
  }
  if (type === "cpe_w") {
    const cpeIndex = counters.cpe++;
    const wIndex = counters.w++;
    return { type, cpeLabel: `CPE${cpeIndex}`, wLabel: `W${wIndex}`, qParam: `Q${cpeIndex}`, nParam: `n${cpeIndex}`, wParam: `WA${wIndex}` };
  }
  if (type === "r_cpe_w") {
    const rIndex = counters.r++;
    const cpeIndex = counters.cpe++;
    const wIndex = counters.w++;
    return { type, rLabel: `R${rIndex}`, cpeLabel: `CPE${cpeIndex}`, wLabel: `W${wIndex}`, rParam: `R${rIndex}`, qParam: `Q${cpeIndex}`, nParam: `n${cpeIndex}`, wParam: `WA${wIndex}` };
  }
  const rIndex = counters.r++;
  const cpeIndex = counters.cpe++;
  return { type: "r_cpe", rLabel: `R${rIndex}`, cpeLabel: `CPE${cpeIndex}`, rParam: `R${rIndex}`, qParam: `Q${cpeIndex}`, nParam: `n${cpeIndex}` };
}

function markCircuitOutdated(dataset = getActiveDataset(), message = t("circuitChangedRefit")) {
  if (!dataset) return;
  dataset.fitOutdated = true;
  dataset.fittingStatus = "outdated";
  renderCircuitModel();
  if (state.result?.dataset === dataset) {
    state.result.circuitFit = {
      ...(state.result.circuitFit || {}),
      elements: cloneCircuitElements(getCircuitElements(dataset)),
      modelText: circuitText(getCircuitElements(dataset)),
      implemented: true,
      updated: false,
      fitted: [],
      params: {}
    };
    state.result.fitted = [];
    state.result.residuals = [];
    state.result.rmse = NaN;
    state.result.normalizedRmse = NaN;
    renderResult(state.result);
    el.runLog.textContent = `${message}\n${circuitText(getCircuitElements(dataset))}`;
  } else {
    el.runLog.textContent = `${message}\n${circuitText(getCircuitElements(dataset))}`;
  }
  setStatus(message);
}

function refitActiveDataset() {
  const dataset = getActiveDataset();
  if (!dataset) return;
  if (!state.result || state.result.dataset !== dataset) {
    analyzeActiveDataset();
    return;
  }
  if (el.fixRsInput.checked && !(Number(el.rsValueInput.value) > 0)) {
    setStatus(t("enterRs"));
    el.runLog.textContent = t("enterRs");
    return;
  }
  try {
    refitEquivalentCircuit(state.result);
    dataset.fitOutdated = false;
    dataset.fittingStatus = "updated";
    dataset.result = state.result;
    renderResult(state.result);
    setStatus(`${getProjectName(dataset)} ${t("fitStatusUpdated")}`);
  } catch (error) {
    dataset.fittingStatus = "failed";
    setStatus(t("statusFailed"));
    el.runLog.textContent = `${t("fittingFailed")}\n${error.message || error}`;
    updateFitStatus(state.result);
  }
}

function refitEquivalentCircuit(result) {
  const dataset = result.dataset;
  const options = {
    ...result.options,
    fixRs: el.fixRsInput.checked,
    fixedRs: Number(el.rsValueInput.value) || null,
    peakSensitivity: state.peakSensitivity
  };
  const circuitFit = fitEquivalentCircuit(dataset.points, getCircuitElements(dataset), options, {
    rInf: result.rInf,
    peaks: result.peaks,
    drtFitted: result.drtFitted
  });
  const fitted = circuitFit.fitted;
  const residuals = dataset.points.map((point, index) => ({
    frequency: point.frequency,
    real: point.zReal - fitted[index].zReal,
    negImag: point.zNegImag - fitted[index].zNegImag
  }));
  const rmse = Math.sqrt(
    residuals.reduce((sum, item) => sum + item.real * item.real + item.negImag * item.negImag, 0) /
      Math.max(residuals.length * 2, 1)
  );
  const scale = Math.max(...dataset.points.map((point) => Math.hypot(point.zReal, point.zNegImag)), 1e-12);
  result.options = options;
  result.circuitFit = circuitFit;
  result.fitted = fitted;
  result.residuals = residuals;
  result.rmse = rmse;
  result.normalizedRmse = rmse / scale;
  result.createdAt = new Date().toISOString();
}

function checkEnvironment() {
  const required = [
    ["FileReader", "FileReader" in window],
    ["Blob", "Blob" in window],
    ["URL.createObjectURL", !!window.URL?.createObjectURL],
    ["TextEncoder", "TextEncoder" in window],
    ["XMLSerializer", "XMLSerializer" in window],
    ["Canvas", "HTMLCanvasElement" in window]
  ];
  const missing = required.filter(([, ok]) => !ok).map(([name]) => name);
  return { ok: missing.length === 0, missing };
}

function environmentMessage() {
  if (state.environment.ok) return t("environmentReady");
  return `${t("environmentMissing")}: ${state.environment.missing.join(", ")}`;
}

function initialRunLog() {
  return `${t("noRun")}\n${environmentMessage()}`;
}

function updateDistributionTitle() {
  const node = document.getElementById("distributionHeading");
  if (node) node.textContent = t("distribution");
}

function currentGraphStyle(dataset = getActiveDataset()) {
  const settings = dataset ? getActiveGraphSettings(dataset) : null;
  const graphStyle = settings?.graphStyle || state.graphStyle;
  const preset = graphStylePresets[graphStyle] || graphStylePresets.journal;
  const pointSize = getProjectPointSize(dataset);
  const dataColor = settings?.dataColor || state.dataColor;
  const fitColor = settings?.fitColor || state.fitColor;
  const peakColor = settings?.pointColor || state.pointColor;
  return {
    ...preset,
    data: dataColor || preset.data,
    fit: fitColor || preset.fit,
    phaseData: dataColor || preset.phaseData,
    phaseFit: fitColor || preset.phaseFit,
    residualReal: dataColor || preset.residualReal,
    residualImag: fitColor || preset.residualImag,
    gamma: dataColor || preset.gamma,
    peak: peakColor || preset.peak,
    pointShape: getAllowedPointShape(settings?.pointShape || state.pointShape),
    pointRadius: pointSize,
    peakRadius: clamp(pointSize * 1.45, 3, 16),
    labelSize: getProjectLabelSize(dataset)
  };
}

function tauToFrequency(tau) {
  return 1 / (TAU * tau);
}

function t(key) {
  return translations[state.language]?.[key] || translations.en[key] || key;
}

function applyLanguage(language) {
  if (!translations[language]) return;
  state.language = language;
  try {
    localStorage.setItem("auto-drt-language", language);
  } catch {
    // Local storage may be unavailable for some file:// policies.
  }

  el.html.lang = language === "zh" ? "zh-CN" : language;
  document.title = "Auto DRT Analyzer";
  el.languageButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === language);
    button.setAttribute("aria-pressed", button.dataset.lang === language ? "true" : "false");
  });

  uiBindings.forEach(([id, key]) => {
    const node = document.getElementById(id);
    if (node) node.textContent = t(key);
  });

  const openText = el.openFileLabel?.querySelector("span");
  if (openText) openText.textContent = t("open");
  el.sampleBtn.title = t("sampleTitle");
  el.openFileLabel.title = t("openTitle");
  el.exportExcelBtn.textContent = t("exportExcel");
  el.exportExcelBtn.title = t("exportExcelTitle");
  if (el.exportFitDataBtn) {
    el.exportFitDataBtn.textContent = t("exportFitData");
    el.exportFitDataBtn.title = t("exportFitDataTitle");
  }
  el.figureSaveButtons.forEach((button) => {
    button.textContent = button.dataset.chartKey === "circuit" ? t("saveCircuit") : t("save");
    button.title = t("saveFigure");
  });
  el.lambdaModeSelect.options[0].textContent = t("auto");
  el.lambdaModeSelect.options[1].textContent = t("manual");
  el.analysisModeSelect.options[0].textContent = t("modeBalanced");
  el.analysisModeSelect.options[1].textContent = t("modeFit");
  el.analysisModeSelect.options[2].textContent = t("modeSmooth");
  el.graphStyleSelect.options[0].textContent = t("styleJournal");
  el.graphStyleSelect.options[1].textContent = t("stylePresentation");
  el.graphStyleSelect.options[2].textContent = t("styleClassic");
  el.graphStyleSelect.options[3].textContent = t("styleDark");
  el.pointShapeSelect.options[0].textContent = t("shapeCircle");
  el.pointShapeSelect.options[1].textContent = t("shapeSquare");
  el.pointShapeSelect.options[2].textContent = t("shapeTriangle");
  el.pointShapeSelect.options[3].textContent = t("shapeDiamond");
  el.pointShapeSelect.options[4].textContent = t("shapeCross");
  el.peakSensitivitySelect.options[0].textContent = t("sensitivityLow");
  el.peakSensitivitySelect.options[1].textContent = t("sensitivityNormal");
  el.peakSensitivitySelect.options[2].textContent = t("sensitivityHigh");
  const elementLabels = {
    r_cpe: "R || CPE",
    r: "R",
    c: "C",
    cpe: "CPE",
    w: "W",
    r_c: "R || C",
    r_w: "R || W",
    cpe_w: "CPE || W",
    r_cpe_w: "R || CPE || W"
  };
  Array.from(el.addCircuitElementSelect?.options || []).forEach((option) => {
    option.textContent = elementLabels[option.value] || option.value;
  });
  el.axisRangeCloseBtn.setAttribute("aria-label", t("close"));
  populateAxisExpressionOptions();
  el.figureSaveCloseBtn.setAttribute("aria-label", t("close"));
  setDrtAxis(state.drtAxis);
  applyGraphStyle(state.graphStyle);
  renderProjectList();
  renderDrtRegionList();
  renderDrtAreaAnalysis();

  const topActions = document.querySelector(".top-actions");
  if (topActions) topActions.setAttribute("aria-label", t("analysisActions"));
  const tabs = document.querySelector(".tabs");
  if (tabs) tabs.setAttribute("aria-label", t("views"));
  document.getElementById("eisPanel")?.setAttribute("aria-label", t("eisPlots"));
  document.getElementById("drtPanel")?.setAttribute("aria-label", t("drtPlots"));
  document.getElementById("diagnosticsPanel")?.setAttribute("aria-label", t("runDiagnostics"));

  if (!state.result) {
    el.runLog.textContent = initialRunLog();
    if (!getActiveDataset()) setStatus(t("noDataset"));
  }
}

async function handleFiles(event) {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;

  const parsed = [];
  for (const file of files) {
    const text = await file.text();
    try {
      parsed.push(parseEisText(text, file.name));
    } catch (error) {
      appendLog(`Skipped ${file.name}: ${error.message}`);
    }
  }

  if (!parsed.length) {
    setStatus(t("statusNoValid"));
    return;
  }

  const hadProjects = state.datasets.length > 0;
  if (!hadProjects) resetAreaNormalizationDefaults(parsed);
  parsed.forEach((dataset, offset) => {
    ensureProject(dataset, state.datasets.length + offset);
    dataset.graphSettings = {
      ...dataset.graphSettings,
      dataColor: projectColor(state.datasets.length + offset)
    };
    if (hadProjects) {
      dataset.impedanceUnit = "ohm";
      dataset.electrodeArea = null;
      dataset.electrodeAreaSource = "default";
    }
  });
  const nextActiveIndex = state.datasets.length;
  state.datasets = [...state.datasets, ...parsed];
  state.activeIndex = nextActiveIndex;
  state.result = getActiveDataset()?.result || null;
  if (!hadProjects) resetAxisRanges();
  populateFileSelect();
  renderActiveProject();
  el.fileInput.value = "";
}

function loadSample() {
  const text = makeSampleData();
  const parsed = parseEisText(text, "synthetic-two-arc-eis.csv");
  const hadProjects = state.datasets.length > 0;
  if (!hadProjects) resetAreaNormalizationDefaults(parsed);
  ensureProject(parsed, state.datasets.length);
  parsed.graphSettings = {
    ...parsed.graphSettings,
    dataColor: projectColor(state.datasets.length)
  };
  if (hadProjects) {
    parsed.impedanceUnit = "ohm";
    parsed.electrodeArea = null;
    parsed.electrodeAreaSource = "default";
  }
  state.datasets = [...state.datasets, parsed];
  state.activeIndex = state.datasets.length - 1;
  state.result = null;
  if (!hadProjects) resetAxisRanges();
  populateFileSelect();
  renderActiveProject();
  analyzeActiveDataset();
}

function populateFileSelect() {
  el.fileSelect.innerHTML = "";
  state.datasets.forEach((dataset, index) => {
    ensureProject(dataset, index);
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = getProjectName(dataset);
    el.fileSelect.appendChild(option);
  });
  el.fileSelect.disabled = state.datasets.length === 0;
  el.fileSelect.value = String(state.activeIndex);
  el.fileSelectField.hidden = state.datasets.length <= 1;
  el.analyzeBtn.disabled = state.activeIndex < 0;
  renderProjectList();
  syncProjectNameInput();
}

function renderProjectList() {
  if (!el.projectList) return;
  if (!state.datasets.length) {
    el.projectList.innerHTML = `<div class="project-list-empty">-</div>`;
    return;
  }
  el.projectList.innerHTML = state.datasets.map((dataset, index) => {
    const active = index === state.activeIndex;
    const analyzed = dataset.result ? " analyzed" : "";
    return `
      <div class="project-list-item${active ? " active" : ""}">
        <button type="button" class="project-select${active ? " active" : ""}" data-select-project="${index}" title="${escapeHtml(dataset.sourceName || dataset.name)}">
          <span>${escapeHtml(getProjectName(dataset))}</span>
          <small>${escapeHtml(dataset.sourceName || dataset.name)}${analyzed}</small>
        </button>
        <button type="button" class="project-delete" data-delete-project="${index}" title="${escapeHtml(t("deleteProject"))}">${escapeHtml(t("deleteProject"))}</button>
      </div>
    `;
  }).join("");
}

function setActiveIndex(index) {
  if (!state.datasets.length) {
    state.activeIndex = -1;
    state.result = null;
    clearResult();
    return;
  }
  state.activeIndex = clamp(Number.isFinite(index) ? index : 0, 0, state.datasets.length - 1);
  state.result = getActiveDataset()?.result || null;
  syncStateFromGraphSettings(getActiveDataset());
  applyGraphStyle(state.graphStyle);
  populateFileSelect();
  renderActiveProject();
}

function deleteProject(index) {
  if (!Number.isFinite(index) || index < 0 || index >= state.datasets.length) return;
  const oldActiveIndex = state.activeIndex;
  const deletedActive = index === oldActiveIndex;
  const deletedProjectId = state.datasets[index]?.id;
  state.datasets.splice(index, 1);
  removeLegendPositionsForProject(deletedProjectId);
  if (!state.datasets.length) {
    state.activeIndex = -1;
    state.result = null;
    populateFileSelect();
    clearResult();
    return;
  }
  state.activeIndex = deletedActive
    ? Math.min(index, state.datasets.length - 1)
    : index < oldActiveIndex
      ? oldActiveIndex - 1
      : oldActiveIndex;
  state.result = getActiveDataset()?.result || null;
  syncStateFromGraphSettings(getActiveDataset());
  populateFileSelect();
  renderActiveProject();
}

function updateDatasetStatus() {
  const dataset = getActiveDataset();
  if (!dataset) {
    setStatus(t("noDataset"));
    syncProjectNameInput();
    syncCircuitControls();
    syncAreaControls();
    return;
  }
  const minF = Math.min(...dataset.points.map((p) => p.frequency));
  const maxF = Math.max(...dataset.points.map((p) => p.frequency));
  syncProjectNameInput();
  syncCircuitControls();
  syncAreaControls();
  setStatus(`${getProjectName(dataset)} | ${dataset.points.length} ${t("statusPoints")} | ${formatNumber(minF)}-${formatNumber(maxF)} Hz`);
}

function setStatus(text) {
  el.statusText.textContent = text;
}

function getActiveDataset() {
  if (state.activeIndex < 0) return null;
  return state.datasets[state.activeIndex] || null;
}

function syncProjectNameInput() {
  const dataset = getActiveDataset();
  el.projectNameInput.disabled = !dataset;
  if (document.activeElement === el.projectNameInput) return;
  el.projectNameInput.value = dataset ? getProjectName(dataset) : "";
}

function syncAreaControls() {
  syncGraphControls();
}

function getProjectName(dataset) {
  if (!dataset) return "DRT";
  const name = typeof dataset.projectName === "string" ? dataset.projectName.trim() : "";
  return name || stripExtension(dataset.name) || "DRT";
}

function stripExtension(name) {
  return (name || "DRT").replace(/\.[^/.]+$/, "").trim() || "DRT";
}

function clearResult() {
  state.result = null;
  resetAxisRanges();
  el.exportExcelBtn.disabled = true;
  if (el.exportFitDataBtn) el.exportFitDataBtn.disabled = true;
  el.refitBtn.disabled = true;
  setFigureSaveEnabled(false);
  el.detectPeaksBtn.disabled = true;
  el.summaryPoints.textContent = "-";
  el.summaryFreq.textContent = "-";
  el.summaryLambda.textContent = "-";
  el.summaryPeaks.textContent = "-";
  el.summaryDrtAxis.textContent = "-";
  el.summaryDrtYLabel.textContent = "-";
  el.eisQualityPoints.textContent = "-";
  el.eisQualityFreq.textContent = "-";
  el.eisQualityRinf.textContent = "-";
  el.eisQualityRmse.textContent = "-";
  el.peaksTableBody.innerHTML = '<tr><td colspan="9">-</td></tr>';
  if (el.fitParamsBody) el.fitParamsBody.innerHTML = '<tr><td colspan="4">-</td></tr>';
  updateFitStatus(null);
  el.runLog.textContent = initialRunLog();
  updateDistributionTitle();
  renderProjectList();
  renderDrtAreaAnalysis();
  renderCircuitModel();
  drawEmptyCharts();
}

function renderActiveProject() {
  const dataset = getActiveDataset();
  if (!dataset) {
    clearResult();
    return;
  }
  ensureProject(dataset, state.activeIndex);
  state.result = dataset.result || null;
  syncStateFromGraphSettings(dataset);
  syncProjectNameInput();
  syncCircuitControls();
  syncAreaControls();
  syncAnalysisControls(dataset);
  renderProjectList();
  updateDatasetStatus();
  if (state.result) {
    renderResult(state.result);
    return;
  }
  renderNoActiveResult();
}

function renderNoActiveResult() {
  el.exportExcelBtn.disabled = true;
  if (el.exportFitDataBtn) el.exportFitDataBtn.disabled = true;
  el.refitBtn.disabled = true;
  setFigureSaveEnabled(false);
  el.detectPeaksBtn.disabled = true;
  el.summaryPoints.textContent = "-";
  el.summaryFreq.textContent = "-";
  el.summaryLambda.textContent = "-";
  el.summaryPeaks.textContent = "-";
  el.summaryDrtAxis.textContent = drtXAxisLabel();
  el.summaryDrtYLabel.textContent = drtYLabel();
  el.eisQualityPoints.textContent = "-";
  el.eisQualityFreq.textContent = "-";
  el.eisQualityRinf.textContent = "-";
  el.eisQualityRmse.textContent = "-";
  el.peaksTableBody.innerHTML = '<tr><td colspan="9">-</td></tr>';
  if (el.fitParamsBody) el.fitParamsBody.innerHTML = '<tr><td colspan="4">-</td></tr>';
  updateFitStatus(null);
  el.runLog.textContent = initialRunLog();
  renderCircuitModel();
  const style = currentGraphStyle();
  const chartOptions = (options) => ({
    lineWidth: style.lineWidth,
    pointRadius: style.pointRadius,
    peakRadius: style.peakRadius,
    legendLineWidth: style.legendLineWidth,
    labelSize: style.labelSize,
    pointShape: style.pointShape,
    showGrid: style.showGrid,
    ...options
  });
  drawEisOverlayCharts(chartOptions);
  drawChartMessage(el.residualChart, t("noRun"));
  drawDrtOverlayChart();
  renderDrtAreaAnalysis();
}

function syncAnalysisControls(dataset = getActiveDataset()) {
  const gridSize = clamp(Number(dataset?.drtGridSize) || Number(dataset?.result?.options?.gridSize) || Number(el.gridSizeInput.value) || 80, 40, 140);
  el.gridSizeInput.value = String(gridSize);
}

function updateDrtGridForActiveProject() {
  const dataset = getActiveDataset();
  if (!dataset) return;
  const next = clamp(Number(el.gridSizeInput.value) || 80, 40, 140);
  dataset.drtGridSize = next;
  el.gridSizeInput.value = String(next);
  if (!dataset.result) return;
  setStatus(t("drtGridChanged"));
  analyzeActiveDataset();
}

function analyzeActiveDataset() {
  const dataset = getActiveDataset();
  if (!dataset) return;
  if (el.fixRsInput.checked && !(Number(el.rsValueInput.value) > 0)) {
    setStatus(t("enterRs"));
    el.runLog.textContent = t("enterRs");
    return;
  }

  const options = {
    gridSize: clamp(Number(el.gridSizeInput.value) || 80, 40, 140),
    tauPadding: Number(el.tauPaddingSelect.value) || 10,
    lambdaMode: el.lambdaModeSelect.value,
    manualLambda: Math.max(Number(el.manualLambdaInput.value) || 1e-3, 1e-12),
    analysisMode: el.analysisModeSelect.value || "balanced",
    fixRs: el.fixRsInput.checked,
    fixedRs: Number(el.rsValueInput.value) || null,
    peakSensitivity: state.peakSensitivity
  };
  el.gridSizeInput.value = String(options.gridSize);
  dataset.drtGridSize = options.gridSize;
  getActiveGraphSettings(dataset).peakSensitivity = options.peakSensitivity;

  try {
    const result = runDrtAnalysis(dataset, options);
    dataset.result = result;
    dataset.drtData = {
      tauGrid: result.tauGrid,
      gamma: result.gamma,
      deltaLogTau: result.deltaLogTau
    };
    dataset.calculatedDrtData = dataset.drtData;
    dataset.detectedPeaks = result.peaks;
    dataset.drtAreaResults = calculateDrtAreasForResult(result);
    state.result = result;
    renderResult(result);
    populateFileSelect();
    setStatus(`${getProjectName(dataset)} ${t("statusAnalyzed")}`);
  } catch (error) {
    dataset.fittingStatus = "failed";
    console.error("Analysis failed:", error);
    setStatus(`${t("statusFailed")}: ${error.message || error}`);
    el.runLog.textContent = analysisErrorReport(error, dataset, options);
    updateFitStatus();
  }
}

function analysisErrorReport(error, dataset, options = {}) {
  const frequencies = (dataset?.points || []).map((point) => point.frequency).filter(Number.isFinite);
  const frequencyRange = frequencies.length
    ? `${formatNumber(Math.min(...frequencies))}-${formatNumber(Math.max(...frequencies))} Hz`
    : "-";
  const areaEnabled = isAnyAreaNormalizationEnabled(dataset);
  return [
    `${t("statusFailed")}: ${error?.message || error}`,
    "",
    `Error type: ${error?.name || "Error"}`,
    `Error message: ${error?.message || error}`,
    `Stack trace: ${error?.stack || "-"}`,
    "",
    `Current project: ${getProjectName(dataset)}`,
    `Input file: ${dataset?.originalName || dataset?.name || "-"}`,
    `Number of data points: ${dataset?.points?.length || 0}`,
    `Frequency range: ${frequencyRange}`,
    `Axis settings: Nyquist X=${zRealLabel()}, Nyquist Y=${zNegImagLabel()}, Bode magnitude Y=${magnitudeLabel()}, Bode phase Y=${phaseLabel()}, DRT X=${drtXAxisLabel()}, DRT Y=${drtYLabel()}`,
    `Area normalization: ${areaEnabled ? "Yes" : "No"}`,
    `Electrode area / cm2: ${areaEnabled ? getEffectiveElectrodeArea(dataset) : ""}`,
    `Circuit model: ${circuitText(getCircuitElements(dataset))}`,
    `Lambda mode: ${options.lambdaMode || "-"}`
  ].join("\n");
}

function refreshDetectedPeaks(showMarkers) {
  const result = state.result;
  if (!result) return;
  result.options.peakSensitivity = state.peakSensitivity;
  const autoPeaks = detectPeaks(result.tauGrid, result.gamma, result.deltaLogTau, {
    min: Math.min(...result.tauGrid),
    max: Math.max(...result.tauGrid)
  }, state.peakSensitivity);
  result.peaks = mergeManualPeaks(autoPeaks, result.dataset.manualPeaks, result);
  result.dataset.detectedPeaks = result.peaks;
  result.dataset.drtAreaResults = calculateDrtAreasForResult(result);
  if (showMarkers) {
    state.showPeaks = true;
    updateActiveGraphSetting("showPeaks", true);
    savePreference("auto-drt-show-peaks", "1");
  }
  renderResult(result);
}

function openDrtPeakContextMenu(event) {
  if (!state.result || event.target.closest?.(".draggable-legend")) return;
  event.preventDefault();
  const svg = el.drtChart;
  const metadata = state.lastChartDomains.drt;
  if (!metadata) return;
  const point = svgPointFromEvent(svg, event);
  const left = Number(svg.dataset.plotLeft);
  const right = Number(svg.dataset.plotRight);
  const top = Number(svg.dataset.plotTop);
  const bottom = Number(svg.dataset.plotBottom);
  if (point.x < left || point.x > right || point.y < top || point.y > bottom) return;
  const nearest = nearestDisplayedPeak(point);
  const items = nearest
    ? [
        { label: t("removeThisPeak"), action: () => removePeak(nearest.peak) },
        { label: t("renamePeak"), action: () => renamePeak(nearest.peak, nearest.index) },
        { label: t("clearManualPeaks"), action: clearManualPeaks },
        { label: t("resetAutomaticPeaks"), action: () => refreshDetectedPeaks(true) }
      ]
    : [
        { label: t("addDrtPeakHere"), action: () => addManualPeakAtPoint(point) },
        { label: t("clearManualPeaks"), action: clearManualPeaks },
        { label: t("resetAutomaticPeaks"), action: () => refreshDetectedPeaks(true) }
      ];
  showDrtContextMenu(event, items);
}

function showDrtContextMenu(event, items) {
  const menu = el.drtContextMenu;
  if (!menu) return;
  menu.innerHTML = "";
  items.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = item.label;
    button.addEventListener("click", (clickEvent) => {
      clickEvent.stopPropagation();
      closeDrtPeakContextMenu();
      item.action();
    });
    menu.appendChild(button);
  });
  menu.style.left = `${event.clientX}px`;
  menu.style.top = `${event.clientY}px`;
  menu.hidden = false;
}

function closeDrtPeakContextMenu() {
  if (el.drtContextMenu) el.drtContextMenu.hidden = true;
}

function addManualPeakAtPoint(point) {
  if (!state.result) return;
  const svg = el.drtChart;
  const metadata = state.lastChartDomains.drt;
  if (!metadata) return;
  const left = Number(svg.dataset.plotLeft);
  const right = Number(svg.dataset.plotRight);
  const xValue = invertScale(point.x, metadata.xDomain, [left, right], metadata.xScale);
  const tau = drtXAxisMode() === "frequency" ? 1 / (TAU * xValue) : xValue;
  if (!Number.isFinite(tau) || tau <= 0) return;
  const dataset = state.result.dataset;
  if (!Array.isArray(dataset.manualPeaks)) dataset.manualPeaks = [];
  dataset.manualPeaks.push({
    id: `manual-${Date.now()}-${dataset.manualPeaks.length}`,
    tau,
    name: `${t("peakSourceManual")} ${dataset.manualPeaks.length + 1}`
  });
  state.showPeaks = true;
  updateActiveGraphSetting("showPeaks", true);
  savePreference("auto-drt-show-peaks", "1");
  state.result.peaks = mergeManualPeaks(
    state.result.peaks.filter((peak) => peak.source !== "Manual"),
    dataset.manualPeaks,
    state.result
  );
  renderResult(state.result);
}

function nearestDisplayedPeak(point) {
  const result = state.result;
  const metadata = state.lastChartDomains.drt;
  const svg = el.drtChart;
  if (!result || !metadata || !svg) return null;
  const box = svg.getBoundingClientRect();
  const viewWidth = Number(svg.dataset.viewWidth) || 720;
  const tolerance = 14 * viewWidth / Math.max(box.width, 1);
  const yTolerance = 80 * viewWidth / Math.max(box.width, 1);
  const xMap = makeScale(metadata.xDomain, [Number(svg.dataset.plotLeft), Number(svg.dataset.plotRight)], metadata.xScale);
  const yMap = makeScale(metadata.yDomain, [Number(svg.dataset.plotBottom), Number(svg.dataset.plotTop)], metadata.yScale);
  const drtUsesFrequency = drtXAxisMode() === "frequency";
  const drtScale = drtDisplayScale(result.dataset);
  let nearest = null;
  result.peaks.forEach((peak, index) => {
    const x = xMap(drtUsesFrequency ? peak.frequency : peak.tau);
    const y = yMap(peak.gamma * drtScale);
    const xDistance = Math.abs(point.x - x);
    const yDistance = Math.abs(point.y - y);
    const distance = Math.hypot(point.x - x, point.y - y);
    const isNear = distance <= tolerance || xDistance <= tolerance * 2 || (xDistance <= tolerance && yDistance <= yTolerance);
    if (isNear && (!nearest || distance < nearest.distance)) nearest = { peak, index, distance };
  });
  return nearest;
}

function removePeak(peak) {
  const result = state.result;
  if (!result || !peak) return;
  if (peak.source === "Manual") {
    const manual = result.dataset.manualPeaks || [];
    result.dataset.manualPeaks = manual.filter((item) => item.id !== peak.id);
  }
  result.peaks = result.peaks.filter((item) => item.id !== peak.id);
  renderResult(result);
}

function clearManualPeaks() {
  const result = state.result;
  if (!result) return;
  result.dataset.manualPeaks = [];
  result.peaks = result.peaks.filter((peak) => peak.source !== "Manual");
  renderResult(result);
}

function renamePeakFromTable(event) {
  const cell = event.target.closest?.("[data-peak-name]");
  if (!cell) return;
  const result = state.datasets.find((dataset) => dataset.id === cell.dataset.projectId)?.result || state.result;
  if (!result) return;
  const index = Number(cell.dataset.peakIndex);
  const peak = result.peaks[index];
  if (!peak) return;
  renamePeak(peak, index, result);
}

function renamePeak(peak, index, result = state.result) {
  const nextName = window.prompt(t("renamePeak"), peak.name || defaultPeakName(peak, index));
  if (!nextName) return;
  peak.name = nextName.trim();
  if (peak.source === "Manual") {
    const manual = result.dataset.manualPeaks?.find((item) => item.id === peak.id);
    if (manual) manual.name = peak.name;
  }
  result.dataset.detectedPeaks = result.peaks;
  if (result === state.result) renderResult(result);
  else {
    renderPeaks();
    drawDrtOverlayChart();
  }
}

function invertScale(pixel, domain, range, scaleType) {
  const tValue = (pixel - range[0]) / (range[1] - range[0] || 1);
  if (scaleType === "log") {
    const d0 = Math.log10(domain[0]);
    const d1 = Math.log10(domain[1]);
    return Math.pow(10, d0 + tValue * (d1 - d0));
  }
  return domain[0] + tValue * (domain[1] - domain[0]);
}

function parseEisText(text, name) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && !line.startsWith("//"));

  if (!lines.length) throw new Error("empty file");

  const rows = lines.map((line) => tokenize(line));
  const numericInfo = rows.map((tokens) => tokens.map(parseNumber));
  const firstNumericRow = numericInfo.findIndex((values) => values.filter(Number.isFinite).length >= 3);
  if (firstNumericRow < 0) throw new Error("expected at least 3 numeric columns");

  const header = firstNumericRow > 0 ? rows[firstNumericRow - 1].map((token) => token.toLowerCase()) : [];
  const columnMap = inferColumns(header);
  const points = [];

  for (let i = firstNumericRow; i < rows.length; i += 1) {
    const values = numericInfo[i];
    const finiteIndices = values
      .map((value, index) => ({ value, index }))
      .filter((item) => Number.isFinite(item.value));

    if (finiteIndices.length < 3) continue;

    const frequency = getColumn(values, finiteIndices, columnMap.frequency, 0);
    const zReal = getColumn(values, finiteIndices, columnMap.zReal, 1);
    const zImagRaw = getColumn(values, finiteIndices, columnMap.zImag, 2);

    if (Number.isFinite(frequency) && frequency > 0 && Number.isFinite(zReal) && Number.isFinite(zImagRaw)) {
      points.push({ frequency, zReal, zImagRaw });
    }
  }

  if (points.length < 8) throw new Error("too few valid rows");

  const imagMedian = median(points.map((point) => point.zImagRaw));
  const headerLooksNegative = header.some((token) => token.includes("-z") || token.includes("neg"));
  const inputIsNegativeImag = headerLooksNegative || imagMedian > 0;
  const normalized = points
    .map((point) => ({
      frequency: point.frequency,
      zReal: point.zReal,
      zNegImag: inputIsNegativeImag ? point.zImagRaw : -point.zImagRaw
    }))
    .filter((point) => Number.isFinite(point.zNegImag))
    .sort((a, b) => b.frequency - a.frequency);

  return {
    id: createProjectId(),
    name,
    sourceName: name,
    originalName: name,
    projectName: stripExtension(name),
    circuitElements: defaultCircuitElements(),
    manualPeaks: [],
    impedanceUnit: "ohm",
    electrodeArea: null,
    electrodeAreaSource: "default",
    graphSettings: defaultProjectGraphSettings(state.datasets.length),
    drtGridSize: 80,
    result: null,
    calculatedDrtData: null,
    detectedPeaks: [],
    drtAreaResults: [],
    pointSize: state.pointSize,
    labelSize: state.labelSize,
    points: normalized,
    rawEisData: normalized,
    inputImaginaryColumn: inputIsNegativeImag ? "-Zimag" : "Zimag"
  };
}

function tokenize(line) {
  const delimiter = line.includes("\t")
    ? "\t"
    : line.includes(",")
      ? ","
      : line.includes(";")
        ? ";"
        : null;

  return delimiter
    ? line.split(delimiter).map((token) => token.trim()).filter(Boolean)
    : line.split(/\s+/).map((token) => token.trim()).filter(Boolean);
}

function parseNumber(token) {
  if (typeof token !== "string") return NaN;
  const cleaned = token
    .replace(/^["']|["']$/g, "")
    .replace(/\u2212/g, "-")
    .replace(/ohm/gi, "")
    .trim();
  if (!cleaned) return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
}

function inferColumns(header) {
  if (!header.length) return { frequency: -1, zReal: -1, zImag: -1 };
  const normalized = header.map((token) => token.replace(/[\s_()[\]{}]/g, ""));
  return {
    frequency: normalized.findIndex((token) => token.includes("freq") || token === "f" || token.includes("hz")),
    zReal: normalized.findIndex((token) => token.includes("zreal") || token.includes("zre") || token.includes("rez") || token === "z'"),
    zImag: normalized.findIndex((token) => token.includes("zimag") || token.includes("zim") || token.includes("imz") || token.includes("z''") || token.includes("-z"))
  };
}

function getColumn(values, finiteIndices, preferredIndex, fallbackPosition) {
  if (preferredIndex >= 0 && Number.isFinite(values[preferredIndex])) return values[preferredIndex];
  return finiteIndices[fallbackPosition]?.value ?? NaN;
}

function runDrtAnalysis(dataset, options) {
  const points = dataset.points;
  const frequencies = points.map((point) => point.frequency);
  const zReal = points.map((point) => point.zReal);
  const zNegImag = points.map((point) => point.zNegImag);
  const fMin = Math.min(...frequencies);
  const fMax = Math.max(...frequencies);
  const tauMin = 1 / (TAU * fMax * options.tauPadding);
  const tauMax = options.tauPadding / (TAU * fMin);
  const observableTauMin = 1 / (TAU * fMax);
  const observableTauMax = 1 / (TAU * fMin);
  const tauGrid = logspace(Math.log10(tauMin), Math.log10(tauMax), options.gridSize);
  const deltaLogTau = (Math.log(tauMax) - Math.log(tauMin)) / Math.max(options.gridSize - 1, 1);
  const rInf = options.fixRs && Number.isFinite(options.fixedRs) ? options.fixedRs : estimateRinf(points);

  const system = buildSystem(points, tauGrid, deltaLogTau, rInf);
  const regularizer = buildSecondDifferencePenalty(options.gridSize);
  const scan = options.lambdaMode === "manual"
    ? [{ lambda: options.manualLambda, solution: solveRegularized(system, regularizer, options.manualLambda) }]
    : scanLambda(system, regularizer);
  const selected = options.lambdaMode === "manual" ? scan[0] : selectLambdaByAnalysisMode(scan, options.analysisMode);
  let gamma = selected.solution.gamma.map((value) => Math.max(0, value));
  gamma = smoothSmallNegatives(gamma);

  const autoPeaks = detectPeaks(tauGrid, gamma, deltaLogTau, {
    min: tauMin,
    max: tauMax
  }, options.peakSensitivity);
  const peaks = mergeManualPeaks(autoPeaks, dataset.manualPeaks, {
    tauGrid,
    gamma,
    deltaLogTau
  });
  const drtFitted = predictImpedance(points, tauGrid, deltaLogTau, gamma, rInf);
  const circuitFit = fitEquivalentCircuit(points, getCircuitElements(dataset), options, {
    rInf,
    peaks,
    drtFitted
  });
  dataset.fitOutdated = false;
  dataset.fittingStatus = "updated";
  const fitted = circuitFit.fitted;
  const residuals = points.map((point, index) => ({
    frequency: point.frequency,
    real: point.zReal - fitted[index].zReal,
    negImag: point.zNegImag - fitted[index].zNegImag
  }));
  const rmse = Math.sqrt(
    residuals.reduce((sum, item) => sum + item.real * item.real + item.negImag * item.negImag, 0) /
      Math.max(residuals.length * 2, 1)
  );
  const scale = Math.max(...points.map((point) => Math.hypot(point.zReal, point.zNegImag)), 1e-12);
  const lCurve = scan.map((entry) => ({
    lambda: entry.lambda,
    residual: entry.solution.residualNorm,
    roughness: entry.solution.roughnessNorm
  }));

  return {
    dataset,
    options,
    tauGrid,
    observableTauRange: [observableTauMin, observableTauMax],
    gamma,
    deltaLogTau,
    rInf,
    lambda: selected.lambda,
    fitted,
    drtFitted,
    circuitFit,
    residuals,
    rmse,
    normalizedRmse: rmse / scale,
    peaks,
    lCurve,
    createdAt: new Date().toISOString()
  };
}

function estimateRinf(points) {
  const sorted = [...points].sort((a, b) => b.frequency - a.frequency);
  const highFrequencyCount = Math.max(3, Math.ceil(sorted.length * 0.08));
  const candidates = sorted.slice(0, highFrequencyCount).map((point) => point.zReal);
  return median(candidates);
}

function buildSystem(points, tauGrid, deltaLogTau, rInf) {
  const rows = [];
  const y = [];
  for (const point of points) {
    rows.push(tauGrid.map((tau) => deltaLogTau / (1 + Math.pow(TAU * point.frequency * tau, 2))));
    y.push(point.zReal - rInf);
  }
  for (const point of points) {
    rows.push(tauGrid.map((tau) => {
      const x = TAU * point.frequency * tau;
      return deltaLogTau * x / (1 + x * x);
    }));
    y.push(point.zNegImag);
  }

  const yScale = Math.max(...y.map((value) => Math.abs(value)), 1e-12);
  const scaledRows = rows.map((row) => row.map((value) => value / yScale));
  const scaledY = y.map((value) => value / yScale);
  const n = tauGrid.length;
  const ata = makeMatrix(n, n, 0);
  const aty = Array(n).fill(0);

  for (let r = 0; r < scaledRows.length; r += 1) {
    const row = scaledRows[r];
    const target = scaledY[r];
    for (let i = 0; i < n; i += 1) {
      aty[i] += row[i] * target;
      for (let j = i; j < n; j += 1) {
        ata[i][j] += row[i] * row[j];
      }
    }
  }
  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j < i; j += 1) ata[i][j] = ata[j][i];
  }

  return { rows: scaledRows, y: scaledY, ata, aty };
}

function buildSecondDifferencePenalty(n) {
  const penalty = makeMatrix(n, n, 0);
  for (let row = 0; row < n - 2; row += 1) {
    const indices = [row, row + 1, row + 2];
    const coeffs = [1, -2, 1];
    for (let i = 0; i < 3; i += 1) {
      for (let j = 0; j < 3; j += 1) {
        penalty[indices[i]][indices[j]] += coeffs[i] * coeffs[j];
      }
    }
  }
  return penalty;
}

function scanLambda(system, regularizer) {
  const lambdas = logspace(-8, 1.5, 42);
  return lambdas.map((lambda) => ({
    lambda,
    solution: solveRegularized(system, regularizer, lambda)
  }));
}

function solveRegularized(system, regularizer, lambda) {
  const n = system.aty.length;
  const matrix = makeMatrix(n, n, 0);
  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j < n; j += 1) {
      matrix[i][j] = system.ata[i][j] + lambda * regularizer[i][j];
    }
    matrix[i][i] += 1e-12;
  }
  const gamma = solveLinearSystem(matrix, [...system.aty]);
  const residualNorm = vectorNorm(matVec(system.rows, gamma).map((value, index) => value - system.y[index]));
  const roughnessNorm = roughness(gamma);
  return { gamma, residualNorm, roughnessNorm };
}

function selectLambdaByLCurve(scan) {
  if (scan.length < 3) return scan[0];
  const pts = scan.map((entry) => ({
    entry,
    x: Math.log10(Math.max(entry.solution.residualNorm, 1e-16)),
    y: Math.log10(Math.max(entry.solution.roughnessNorm, 1e-16))
  }));
  let bestIndex = Math.floor(scan.length / 2);
  let bestCurvature = -Infinity;

  for (let i = 1; i < pts.length - 1; i += 1) {
    const curvature = triangleCurvature(pts[i - 1], pts[i], pts[i + 1]);
    if (Number.isFinite(curvature) && curvature > bestCurvature) {
      bestCurvature = curvature;
      bestIndex = i;
    }
  }

  return scan[bestIndex];
}

function selectLambdaByAnalysisMode(scan, mode = "balanced") {
  if (scan.length < 3) return scan[0];
  if (mode === "balanced") return selectLambdaByLCurve(scan);

  const residuals = scan.map((entry) => entry.solution.residualNorm);
  const roughnesses = scan.map((entry) => entry.solution.roughnessNorm);
  const minResidual = Math.min(...residuals);
  const maxResidual = Math.max(...residuals);
  const minRoughness = Math.min(...roughnesses);
  const maxRoughness = Math.max(...roughnesses);
  const weight = mode === "fit" ? { residual: 0.82, roughness: 0.18 } : { residual: 0.32, roughness: 0.68 };

  return scan.reduce((best, entry) => {
    const residualScore = normalizeScore(entry.solution.residualNorm, minResidual, maxResidual);
    const roughnessScore = normalizeScore(entry.solution.roughnessNorm, minRoughness, maxRoughness);
    const score = residualScore * weight.residual + roughnessScore * weight.roughness;
    return score < best.score ? { entry, score } : best;
  }, { entry: scan[0], score: Infinity }).entry;
}

function normalizeScore(value, min, max) {
  if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max) || max <= min) return 0;
  return (value - min) / (max - min);
}

function triangleCurvature(a, b, c) {
  const ab = Math.hypot(b.x - a.x, b.y - a.y);
  const bc = Math.hypot(c.x - b.x, c.y - b.y);
  const ac = Math.hypot(c.x - a.x, c.y - a.y);
  if (ab === 0 || bc === 0 || ac === 0) return 0;
  const area = Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) / 2;
  return (4 * area) / (ab * bc * ac);
}

function smoothSmallNegatives(gamma) {
  const maxGamma = Math.max(...gamma, 0);
  if (maxGamma <= 0) return gamma;
  return gamma.map((value) => (value < maxGamma * 1e-8 ? 0 : value));
}

function predictImpedance(points, tauGrid, deltaLogTau, gamma, rInf) {
  return points.map((point) => {
    let real = rInf;
    let negImag = 0;
    for (let i = 0; i < tauGrid.length; i += 1) {
      const x = TAU * point.frequency * tauGrid[i];
      const denominator = 1 + x * x;
      real += gamma[i] * deltaLogTau / denominator;
      negImag += gamma[i] * deltaLogTau * x / denominator;
    }
    return { frequency: point.frequency, zReal: real, zNegImag: negImag };
  });
}

function fitEquivalentCircuit(points, elementsInput, options, seeds) {
  const elements = cloneCircuitElements(circuitElementsFromInput(elementsInput));
  const params = initializeCircuitParams(points, elements, options, seeds);
  const variables = circuitFitVariables(elements, options);
  const steps = {};
  variables.forEach((name) => {
    steps[name] = name.startsWith("n") ? 0.07 : 0.45;
  });
  let bestParams = { ...params };
  let bestScore = circuitFitScore(points, elements, bestParams);

  for (let cycle = 0; cycle < 32; cycle += 1) {
    let improved = false;
    for (const name of variables) {
      for (const direction of [-1, 1]) {
        const trial = mutateCircuitParam(bestParams, name, steps[name] * direction);
        const score = circuitFitScore(points, elements, trial);
        if (score < bestScore) {
          bestParams = trial;
          bestScore = score;
          improved = true;
        }
      }
    }
    if (!improved) {
      variables.forEach((name) => {
        steps[name] *= 0.62;
      });
    }
  }

  const fitted = predictCircuitImpedance(points, elements, bestParams);
  return {
    model: circuitText(elements),
    modelText: circuitText(elements),
    elements,
    implemented: true,
    experimental: elements.some((element) => element.type === "w" || element.wParam),
    updated: true,
    params: bestParams,
    score: bestScore,
    fitted
  };
}

function initializeCircuitParams(points, elements, options, seeds) {
  const zReals = points.map((point) => point.zReal);
  const zNegImags = points.map((point) => point.zNegImag);
  const minReal = Math.min(...zReals);
  const maxReal = Math.max(...zReals);
  const rs = options.fixRs && Number.isFinite(options.fixedRs) ? options.fixedRs : Math.max(seeds.rInf, 0);
  const span = Math.max(maxReal - rs, Math.max(...zNegImags) * 2, maxReal - minReal, 1e-6);
  const peaks = [...(seeds.peaks || [])].sort((a, b) => b.resistance - a.resistance);
  const defaultTau = 1 / (TAU * median(points.map((point) => point.frequency)));
  const params = { Rs: Math.max(rs, 0) };
  const dynamicElements = elements.filter((element) => element.type !== "rs");
  let peakIndex = 0;
  dynamicElements.forEach((element, index) => {
    const peak = peaks[peakIndex] || null;
    const resistance = Number.isFinite(peak?.resistance) && peak.resistance > 0 ? peak.resistance : span / Math.max(dynamicElements.length, 1);
    const tau = Number.isFinite(peak?.tau) && peak.tau > 0 ? peak.tau : defaultTau * Math.pow(10, index);
    if (element.rParam) {
      params[element.rParam] = Math.max(resistance, 1e-8);
      peakIndex += 1;
    }
    if (element.cParam) params[element.cParam] = clamp(tau / Math.max(resistance, 1e-8), 1e-12, 1e3);
    if (element.param && element.type === "c") params[element.param] = clamp(tau / Math.max(span, 1e-8), 1e-12, 1e3);
    if (element.qParam) {
      const n = 0.86;
      params[element.qParam] = clamp(Math.pow(tau, n) / Math.max(resistance, 1e-8), 1e-12, 1e6);
      params[element.nParam] = n;
    }
    if (element.param && element.type === "cpe") {
      const n = 0.86;
      params[element.qParam] = clamp(Math.pow(tau, n) / Math.max(span, 1e-8), 1e-12, 1e6);
      params[element.nParam] = n;
    }
    const warburgParam = element.wParam || (element.type === "w" ? element.param : "");
    if (warburgParam) {
      const low = [...points].sort((a, b) => a.frequency - b.frequency)[0];
      params[warburgParam] = clamp(Math.max(low?.zNegImag || span * 0.1, 1e-8) * Math.sqrt(2 * TAU * Math.max(low?.frequency || 1, 1e-12)), 1e-9, 1e6);
    }
  });

  return params;
}

function circuitFitVariables(elements, options) {
  const variables = [];
  if (!options.fixRs) variables.push("Rs");
  elements.forEach((element) => {
    if (element.rParam) variables.push(element.rParam);
    if (element.cParam) variables.push(element.cParam);
    if (element.qParam) variables.push(element.qParam, element.nParam);
    if (element.type === "r" || element.type === "c" || element.type === "w") variables.push(element.param);
    if (element.wParam) variables.push(element.wParam);
  });
  return variables;
}

function mutateCircuitParam(params, name, step) {
  const next = { ...params };
  if (name.startsWith("n")) {
    next[name] = clamp((next[name] || 0.86) + step, 0.45, 0.98);
    return next;
  }
  const current = Math.max(next[name] || 1e-9, 1e-12);
  const limit = name.startsWith("Q") ? 1e8 : name.startsWith("C") ? 1e3 : 1e9;
  next[name] = clamp(current * Math.exp(step), 1e-12, limit);
  return next;
}

function circuitFitScore(points, elements, params) {
  const fitted = predictCircuitImpedance(points, elements, params);
  const scale = Math.max(...points.map((point) => Math.hypot(point.zReal, point.zNegImag)), 1e-12);
  return fitted.reduce((sum, point, index) => {
    const real = (point.zReal - points[index].zReal) / scale;
    const negImag = (point.zNegImag - points[index].zNegImag) / scale;
    return sum + real * real + negImag * negImag;
  }, 0) / Math.max(points.length * 2, 1);
}

function predictCircuitImpedance(points, elements, params) {
  return points.map((point) => {
    const z = circuitImpedanceAt(point.frequency, elements, params);
    return {
      frequency: point.frequency,
      zReal: z.re,
      zNegImag: -z.im
    };
  });
}

function circuitImpedanceAt(frequency, elementsInput, params) {
  const elements = circuitElementsFromInput(elementsInput);
  let z = complex(Math.max(params.Rs || 0, 0), 0);
  elements.forEach((element) => {
    const component = circuitElementImpedance(element, params, frequency);
    if (component) z = cAdd(z, component);
  });
  return z;
}

function circuitElementImpedance(element, params, frequency) {
  if (element.type === "rs") return null;
  if (element.type === "r") return resistor(params[element.param]);
  if (element.type === "c") return capacitor(params[element.param], frequency);
  if (element.type === "cpe") return cpe(params[element.qParam], params[element.nParam], frequency);
  if (element.type === "w") return warburg(params[element.param], frequency);
  const branches = [];
  if (element.rParam) branches.push(resistor(params[element.rParam]));
  if (element.cParam) branches.push(capacitor(params[element.cParam], frequency));
  if (element.qParam) branches.push(cpe(params[element.qParam], params[element.nParam], frequency));
  if (element.wParam) branches.push(warburg(params[element.wParam], frequency));
  return parallelImpedance(branches);
}

function resistor(value) {
  return complex(Math.max(value || 0, 0), 0);
}

function capacitor(capacitance, frequency) {
  const c = Math.max(capacitance || 1e-12, 1e-12);
  return complex(0, -1 / (TAU * Math.max(frequency, 1e-12) * c));
}

function cpe(qValue, nValue, frequency) {
  const q = Math.max(qValue || 1e-9, 1e-12);
  const n = clamp(nValue || 0.86, 0.45, 0.98);
  const omegaPower = Math.pow(TAU * Math.max(frequency, 1e-12), n);
  const phase = n * Math.PI / 2;
  return cInv(complex(q * omegaPower * Math.cos(phase), q * omegaPower * Math.sin(phase)));
}

function parallelImpedance(branches) {
  const admittance = branches.filter(Boolean).reduce((sum, branch) => cAdd(sum, cInv(branch)), complex(0, 0));
  return cInv(admittance);
}

function parallelRCpe(resistance, qValue, nValue, frequency) {
  return parallelImpedance([resistor(resistance), cpe(qValue, nValue, frequency)]);
}

function warburg(aValue, frequency) {
  const a = Math.max(aValue || 0, 0);
  const component = a / Math.sqrt(2 * TAU * Math.max(frequency, 1e-12));
  return complex(component, -component);
}

function complex(re, im) {
  return { re, im };
}

function cAdd(a, b) {
  return complex(a.re + b.re, a.im + b.im);
}

function cInv(a) {
  const denominator = a.re * a.re + a.im * a.im || 1e-30;
  return complex(a.re / denominator, -a.im / denominator);
}

function detectPeaks(tauGrid, gamma, deltaLogTau, tauBounds, sensitivity = "normal") {
  const maxGamma = Math.max(...gamma, 0);
  if (maxGamma <= 0) return [];
  const settings = peakDetectionSettings(sensitivity);
  const smooth = smoothSeries(gamma, 5);
  const heightThreshold = maxGamma * settings.height;
  const prominenceThreshold = maxGamma * settings.prominence;
  const valleyWindow = Math.max(5, Math.round(gamma.length * 0.14));
  const candidates = [];

  for (let i = 1; i < smooth.length - 1; i += 1) {
    if (tauGrid[i] < tauBounds.min || tauGrid[i] > tauBounds.max) continue;
    const isLocalMax = smooth[i] >= smooth[i - 1] && smooth[i] >= smooth[i + 1] && (smooth[i] > smooth[i - 1] || smooth[i] > smooth[i + 1]);
    if (!isLocalMax || smooth[i] < heightThreshold) continue;

    const leftStart = Math.max(0, i - valleyWindow);
    const rightEnd = Math.min(smooth.length - 1, i + valleyWindow);
    const leftMin = Math.min(...smooth.slice(leftStart, i + 1));
    const rightMin = Math.min(...smooth.slice(i, rightEnd + 1));
    const prominence = smooth[i] - Math.max(leftMin, rightMin);
    if (prominence < prominenceThreshold) continue;

    let left = i;
    let right = i;
    const halfHeight = Math.max(smooth[i] * 0.5, heightThreshold * 0.7);
    while (left > 0 && smooth[left] > halfHeight) left -= 1;
    while (right < smooth.length - 1 && smooth[right] > halfHeight) right += 1;
    const area = integrateRange(gamma, left, right, deltaLogTau);
    candidates.push({
      index: i,
      id: `auto-${i}`,
      source: "Auto",
      tau: tauGrid[i],
      frequency: 1 / (TAU * tauGrid[i]),
      gamma: gamma[i],
      smoothGamma: smooth[i],
      prominence,
      relativeIntensity: gamma[i] / maxGamma,
      resistance: area,
      leftTau: tauGrid[left],
      rightTau: tauGrid[right],
      labelKey: classifyTauKey(tauGrid[i])
    });
  }

  return selectDistinctPeaks(candidates, settings.minIndexDistance).sort((a, b) => a.tau - b.tau);
}

function mergeManualPeaks(autoPeaks, manualPeaks = [], result) {
  const manual = Array.isArray(manualPeaks) ? manualPeaks : [];
  const manualMapped = manual.map((peak, index) => manualPeakToResultPeak(peak, index, result)).filter(Boolean);
  return [...autoPeaks.map((peak, index) => withPeakDefaults(peak, index, "Auto")), ...manualMapped]
    .sort((a, b) => a.tau - b.tau)
    .map((peak, index) => withPeakDefaults(peak, index, peak.source || "Auto"));
}

function manualPeakToResultPeak(peak, manualIndex, result) {
  const tauGrid = result.tauGrid || [];
  const gamma = result.gamma || [];
  if (!tauGrid.length || !gamma.length || !Number.isFinite(peak.tau)) return null;
  const nearestIndex = nearestTauIndex(tauGrid, peak.tau);
  const tau = tauGrid[nearestIndex];
  const maxGamma = Math.max(...gamma, 1e-12);
  const left = Math.max(0, nearestIndex - 2);
  const right = Math.min(gamma.length - 1, nearestIndex + 2);
  if (!peak.id) peak.id = `manual-${Date.now()}-${manualIndex}`;
  return {
    index: nearestIndex,
    id: peak.id,
    source: "Manual",
    name: peak.name || `${t("peakSourceManual")} ${manualIndex + 1}`,
    tau,
    frequency: tauToFrequency(tau),
    gamma: gamma[nearestIndex],
    smoothGamma: gamma[nearestIndex],
    prominence: gamma[nearestIndex],
    relativeIntensity: gamma[nearestIndex] / maxGamma,
    resistance: integrateRange(gamma, left, right, result.deltaLogTau),
    leftTau: tauGrid[left],
    rightTau: tauGrid[right],
    labelKey: classifyTauKey(tau)
  };
}

function nearestTauIndex(tauGrid, tau) {
  return tauGrid.reduce((bestIndex, currentTau, index) => {
    const bestDistance = Math.abs(Math.log(tauGrid[bestIndex]) - Math.log(tau));
    const currentDistance = Math.abs(Math.log(currentTau) - Math.log(tau));
    return currentDistance < bestDistance ? index : bestIndex;
  }, 0);
}

function withPeakDefaults(peak, index, source) {
  return {
    ...peak,
    source,
    name: peak.name || defaultPeakName({ ...peak, source }, index)
  };
}

function defaultPeakName(peak, index) {
  return peak.source === "Manual" ? `${t("peakSourceManual")} ${index + 1}` : `Peak ${index + 1}`;
}

function peakDetectionSettings(sensitivity) {
  if (sensitivity === "high") return { height: 0.01, prominence: 0.01, minIndexDistance: 2 };
  if (sensitivity === "low") return { height: 0.05, prominence: 0.08, minIndexDistance: 5 };
  return { height: 0.02, prominence: 0.03, minIndexDistance: 3 };
}

function smoothSeries(values, windowSize) {
  const radius = Math.max(1, Math.floor(windowSize / 2));
  return values.map((_, index) => {
    let weighted = 0;
    let totalWeight = 0;
    for (let offset = -radius; offset <= radius; offset += 1) {
      const sourceIndex = index + offset;
      if (sourceIndex < 0 || sourceIndex >= values.length) continue;
      const weight = radius + 1 - Math.abs(offset);
      weighted += values[sourceIndex] * weight;
      totalWeight += weight;
    }
    return totalWeight ? weighted / totalWeight : values[index];
  });
}

function selectDistinctPeaks(peaks, minIndexDistance) {
  const selected = [];
  const sorted = [...peaks].sort((a, b) => (b.prominence || b.gamma) - (a.prominence || a.gamma));
  for (const peak of sorted) {
    const tooClose = selected.some((item) => Math.abs(item.index - peak.index) < minIndexDistance);
    if (!tooClose) selected.push({ ...peak });
  }
  return selected;
}

function integrateRange(values, left, right, delta) {
  let sum = 0;
  for (let i = Math.max(0, left); i <= Math.min(values.length - 1, right); i += 1) {
    sum += values[i] * delta;
  }
  return sum;
}

function classifyTauKey(tau) {
  if (tau < 1e-5) return "highFrequencyProcess";
  if (tau < 1e-3) return "interfaceProcess";
  if (tau < 1e-1) return "chargeTransferProcess";
  return "transportProcess";
}

function translatePeak(peak) {
  return peak.labelKey ? t(peak.labelKey) : peak.label || "";
}

function renderResult(result) {
  if (result?.dataset) {
    result.dataset.result = result;
    syncStateFromGraphSettings(result.dataset);
    syncGraphControls();
  }
  renderDrtSummary(result);
  renderEisQuality(result);
  renderPeaks();
  renderDrtAreaAnalysis();
  renderCircuitModel();
  renderFittingParameters(result);
  updateFitStatus(result);
  renderCharts(result);
  renderLog(result);
  el.showPeaksInput.checked = getActiveGraphSettings(result.dataset).showPeaks === true;
  el.detectPeaksBtn.disabled = false;
  el.exportExcelBtn.disabled = false;
  if (el.exportFitDataBtn) el.exportFitDataBtn.disabled = false;
  el.refitBtn.disabled = false;
  setFigureSaveEnabled(true);
}

function renderDrtSummary(result) {
  const dataset = result.dataset;
  const fMin = Math.min(...dataset.points.map((point) => point.frequency));
  const fMax = Math.max(...dataset.points.map((point) => point.frequency));
  el.summaryPoints.textContent = String(dataset.points.length);
  el.summaryFreq.textContent = `${formatNumber(fMin)}-${formatNumber(fMax)} Hz`;
  el.summaryLambda.textContent = formatNumber(result.lambda);
  el.summaryPeaks.textContent = String(result.peaks.length);
  el.summaryDrtAxis.textContent = drtXAxisLabel();
  el.summaryDrtYLabel.textContent = drtYLabel();
}

function renderEisQuality(result) {
  const dataset = result.dataset;
  const scale = displayScale(dataset);
  const unit = impedanceUnitText();
  const fMin = Math.min(...dataset.points.map((point) => point.frequency));
  const fMax = Math.max(...dataset.points.map((point) => point.frequency));
  const rs = Number.isFinite(result.circuitFit?.params?.Rs) ? result.circuitFit.params.Rs : result.rInf;
  el.eisQualityPoints.textContent = String(dataset.points.length);
  el.eisQualityFreq.textContent = `${formatNumber(fMin)}-${formatNumber(fMax)} Hz`;
  el.eisQualityRinf.textContent = `${formatNumber(rs * scale)} ${unit}`;
  el.eisQualityRmse.textContent = `${formatNumber(result.rmse * scale)} ${unit} (${formatPercent(result.normalizedRmse)})`;
}

function setFigureSaveEnabled(enabled) {
  el.figureSaveButtons.forEach((button) => {
    button.disabled = !enabled;
  });
}

function renderPeaks(peaks) {
  const rows = peaks
    ? [{ result: state.result, peaks }]
    : analyzedResults().map((result) => ({ result, peaks: result.peaks || [] }));
  const flattened = rows.flatMap(({ result, peaks: projectPeaks }) =>
    projectPeaks.map((peak, index) => ({ result, peak, index }))
  );
  if (!flattened.length) {
    // Avoid recursive redraw when a project has no detected or manual peaks.
    el.peaksTableBody.innerHTML = '<tr><td colspan="9">-</td></tr>';
    return;
  }
  el.peaksTableBody.innerHTML = flattened.map(({ result, peak, index }) => `
    <tr title="${escapeHtml(translatePeak(peak))}">
      <td>${escapeHtml(getProjectName(result?.dataset))}</td>
      <td data-peak-name data-project-id="${escapeHtml(result?.dataset?.id || "")}" data-peak-index="${index}" title="${escapeHtml(t("renamePeak"))}">${escapeHtml(peak.name || defaultPeakName(peak, index))}</td>
      <td>${index + 1}</td>
      <td>${escapeHtml(peak.source === "Manual" ? t("peakSourceManual") : t("peakSourceAuto"))}</td>
      <td>${formatNumber(peak.frequency)}</td>
      <td>${formatNumber(peak.tau)}</td>
      <td>${formatNumber(peak.gamma * drtDisplayScale(result?.dataset))} ${escapeHtml(drtYAxisUnitText())}</td>
      <td>${formatPercent(peak.relativeIntensity ?? 0)}</td>
      <td>${escapeHtml(translatePeak(peak))}</td>
    </tr>
  `).join("");
}

function renderDrtRegionList() {
  if (!el.drtRegionList) return;
  el.drtRegionList.innerHTML = state.drtRegions.map((region, index) => `
    <div class="region-row">
      <label class="field compact-field">
        <span>${escapeHtml(t("regionName"))}</span>
        <input type="text" data-region-index="${index}" data-region-field="name" value="${escapeHtml(region.name)}">
      </label>
      <label class="field compact-field">
        <span>${escapeHtml(t("lowerHz"))}</span>
        <input type="number" step="any" min="0" data-region-index="${index}" data-region-field="lowerHz" value="${escapeHtml(region.lowerHz)}">
      </label>
      <label class="field compact-field">
        <span>${escapeHtml(t("upperHz"))}</span>
        <input type="number" step="any" min="0" data-region-index="${index}" data-region-field="upperHz" value="${escapeHtml(region.upperHz)}">
      </label>
      <button type="button" data-delete-region="${index}">${escapeHtml(t("deleteRegion"))}</button>
    </div>
  `).join("");
}

function addDrtRegion() {
  state.drtRegions.push({ id: `region-${Date.now()}`, name: `Region ${state.drtRegions.length + 1}`, lowerHz: "", upperHz: "" });
  renderDrtRegionList();
  renderDrtAreaAnalysis();
}

function deleteDrtRegion(index) {
  if (!Number.isFinite(index) || index < 0 || index >= state.drtRegions.length) return;
  state.drtRegions.splice(index, 1);
  renderDrtRegionList();
  renderDrtAreaAnalysis();
}

function updateDrtRegionFromInput(input) {
  const index = Number(input?.dataset?.regionIndex);
  const field = input?.dataset?.regionField;
  if (!Number.isFinite(index) || !state.drtRegions[index] || !field) return;
  state.drtRegions[index][field] = input.value;
  renderDrtAreaAnalysis();
}

function calculateDrtAreasForResult(result) {
  if (!result) return [];
  return state.drtRegions.map((region) => {
    const area = integrateDrtRegion(result, region);
    return {
      projectName: getProjectName(result.dataset),
      regionName: region.name || t("regionName"),
      lowerHz: normalizeRegionBound(region.lowerHz, 0),
      upperHz: normalizeRegionBound(region.upperHz, Infinity),
      area
    };
  });
}

function normalizeRegionBound(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function integrateDrtRegion(result, region) {
  const data = result.tauGrid
    .map((tau, index) => ({
      f: tauToFrequency(tau),
      gamma: result.gamma[index] * drtDisplayScale(result.dataset)
    }))
    .filter((item) => Number.isFinite(item.f) && item.f > 0 && Number.isFinite(item.gamma))
    .sort((a, b) => a.f - b.f);
  if (data.length < 2) return NaN;
  let lower = normalizeRegionBound(region.lowerHz, data[0].f);
  let upper = normalizeRegionBound(region.upperHz, data[data.length - 1].f);
  if (lower > upper) [lower, upper] = [upper, lower];
  lower = Math.max(lower, data[0].f);
  upper = Math.min(upper, data[data.length - 1].f);
  if (!(upper > lower)) return 0;
  let area = 0;
  for (let i = 0; i < data.length - 1; i += 1) {
    const left = data[i];
    const right = data[i + 1];
    const a = Math.max(lower, left.f);
    const b = Math.min(upper, right.f);
    if (!(b > a)) continue;
    const logLeft = Math.log(left.f);
    const logRight = Math.log(right.f);
    const denominator = logRight - logLeft || 1;
    const interp = (f) => {
      const ratio = (Math.log(f) - logLeft) / denominator;
      return left.gamma + ratio * (right.gamma - left.gamma);
    };
    area += 0.5 * (interp(a) + interp(b)) * (Math.log(b) - Math.log(a));
  }
  return area;
}

function renderDrtAreaAnalysis() {
  if (!el.drtAreaTableBody) return;
  const results = analyzedResults();
  if (!results.length || !state.drtRegions.length) {
    el.drtAreaTableBody.innerHTML = '<tr><td colspan="5">-</td></tr>';
    return;
  }
  const rows = results.flatMap((result) => {
    const areas = calculateDrtAreasForResult(result);
    result.dataset.drtAreaResults = areas;
    return areas;
  });
  if (!rows.length) {
    el.drtAreaTableBody.innerHTML = '<tr><td colspan="5">-</td></tr>';
    return;
  }
  el.drtAreaTableBody.innerHTML = rows.map((row) => `
    <tr>
      <td>${escapeHtml(row.projectName)}</td>
      <td>${escapeHtml(row.regionName)}</td>
      <td>${row.lowerHz === 0 ? "-" : formatNumber(row.lowerHz)}</td>
      <td>${row.upperHz === Infinity ? "-" : formatNumber(row.upperHz)}</td>
      <td>${Number.isFinite(row.area) ? formatNumber(row.area) : "-"}</td>
    </tr>
  `).join("");
}

function renderFittingParameters(result) {
  if (!el.fitParamsBody) return;
  const rows = fittingParameterRows(result);
  if (!rows.length) {
    el.fitParamsBody.innerHTML = '<tr><td colspan="4">-</td></tr>';
    return;
  }
  el.fitParamsBody.innerHTML = rows.map((row) => `
    <tr>
      <td>${escapeHtml(row.parameter)}</td>
      <td>${escapeHtml(row.value)}</td>
      <td>${escapeHtml(row.unit)}</td>
      <td>${escapeHtml(row.note)}</td>
    </tr>
  `).join("");
}

function updateFitStatus(result = state.result) {
  if (!el.fitStatusText) return;
  if (!result) {
    el.fitStatusText.textContent = "-";
    el.fitStatusText.dataset.status = "";
    return;
  }
  const status = getFittingStatus(result);
  const key = status === "failed" ? "fitStatusFailed" : status === "outdated" ? "fitStatusOutdated" : "fitStatusUpdated";
  el.fitStatusText.textContent = status === "outdated" ? t("circuitChangedRefit") : t(key);
  el.fitStatusText.dataset.status = status;
}

function getFittingStatus(result = state.result) {
  const dataset = result?.dataset || getActiveDataset();
  if (dataset?.fittingStatus === "failed") return "failed";
  if (dataset?.fitOutdated || dataset?.fittingStatus === "outdated") return "outdated";
  if (result?.circuitFit?.updated === false) return "outdated";
  return result ? "updated" : "outdated";
}

function fittingParameterRows(result) {
  if (!result) return [];
  const elements = result.circuitFit?.elements || getCircuitElements(result.dataset);
  const params = result.circuitFit?.params || {};
  const unit = impedanceUnitText();
  const scale = displayScale(result.dataset);
  const isOutdated = getFittingStatus(result) !== "updated";
  const numeric = (value, factor = 1) => !isOutdated && Number.isFinite(value) ? formatNumber(value * factor) : t("unavailable");
  const resistance = (value) => numeric(value, scale);
  const rValues = [];
  const rows = [
    {
      parameter: "Rs",
      value: resistance(params.Rs),
      unit,
      note: result.options.fixRs ? t("fixed") : t("free")
    }
  ];

  elements.forEach((element) => {
    if (element.type === "r_cpe") {
      rValues.push(params[element.rParam] || 0);
      addResistanceRow(rows, element.rLabel, params[element.rParam], unit, "R || CPE", resistance);
      addCpeRows(rows, element, params, isOutdated);
    }
    if (element.type === "r") {
      rValues.push(params[element.param] || 0);
      addResistanceRow(rows, element.label, params[element.param], unit, "R", resistance);
    }
    if (element.type === "c") {
      addCapacitanceRow(rows, element.label, params[element.param], isOutdated);
    }
    if (element.type === "cpe") {
      addCpeRows(rows, element, params, isOutdated);
    }
    if (element.type === "r_c") {
      rValues.push(params[element.rParam] || 0);
      addResistanceRow(rows, element.rLabel, params[element.rParam], unit, "R || C", resistance);
      addCapacitanceRow(rows, element.cLabel, params[element.cParam], isOutdated);
    }
    if (element.type === "r_w") {
      rValues.push(params[element.rParam] || 0);
      addResistanceRow(rows, element.rLabel, params[element.rParam], unit, "R || W", resistance);
      addWarburgRow(rows, element.wLabel, params[element.wParam], scale, result.dataset, isOutdated);
    }
    if (element.type === "cpe_w") {
      addCpeRows(rows, element, params, isOutdated);
      addWarburgRow(rows, element.wLabel, params[element.wParam], scale, result.dataset, isOutdated);
    }
    if (element.type === "r_cpe_w") {
      rValues.push(params[element.rParam] || 0);
      addResistanceRow(rows, element.rLabel, params[element.rParam], unit, "R || CPE || W", resistance);
      addCpeRows(rows, element, params, isOutdated);
      addWarburgRow(rows, element.wLabel, params[element.wParam], scale, result.dataset, isOutdated);
    }
    if (element.type === "w") {
      addWarburgRow(rows, element.label, params[element.param], scale, result.dataset, isOutdated);
    }
  });
  const rPol = rValues.reduce((sum, value) => sum + (Number.isFinite(value) ? value : 0), 0);
  rows.push({ parameter: "Rpol", value: isOutdated ? t("unavailable") : formatNumber(rPol * scale), unit, note: "sum of fitted R elements" });
  rows.push({ parameter: "Rtotal", value: isOutdated ? t("unavailable") : formatNumber(((params.Rs || 0) + rPol) * scale), unit, note: "Rs + Rpol" });
  return rows;
}

function addResistanceRow(rows, parameter, value, unit, note, resistance) {
  rows.push({ parameter, value: resistance(value), unit, note });
}

function addCapacitanceRow(rows, parameter, value, isOutdated) {
  rows.push({
    parameter,
    value: !isOutdated && Number.isFinite(value) ? formatNumber(value) : t("unavailable"),
    unit: "F",
    note: "C"
  });
}

function addCpeRows(rows, element, params, isOutdated) {
  rows.push({
    parameter: `${element.cpeLabel}-Q`,
    value: !isOutdated && Number.isFinite(params[element.qParam]) ? formatNumber(params[element.qParam]) : t("unavailable"),
    unit: "S s^n",
    note: "CPE"
  });
  rows.push({
    parameter: `${element.cpeLabel}-n`,
    value: !isOutdated && Number.isFinite(params[element.nParam]) ? formatNumber(params[element.nParam]) : t("unavailable"),
    unit: "",
    note: "CPE"
  });
}

function addWarburgRow(rows, label, value, scale, dataset, isOutdated) {
  rows.push({
    parameter: `${label}-A`,
    value: !isOutdated && Number.isFinite(value) ? formatNumber(value * scale) : t("unavailable"),
    unit: isEisAreaNormalizationEnabled() ? "Ω cm² s^-0.5" : "Ω s^-0.5",
    note: t("experimental")
  });
}

function eisDisplayInfo(dataset) {
  const areaNormalization = isEisAreaNormalizationEnabled();
  const zRealAxisLabel = zRealLabel();
  const zNegImagAxisLabel = zNegImagLabel();
  const magnitudeAxisLabel = magnitudeLabel();
  return {
    areaNormalization,
    unit: areaNormalization ? "Ω cm²" : "Ω",
    unitSlug: areaNormalization ? "ohm_cm2" : "ohm",
    electrodeArea: areaNormalization ? getEffectiveElectrodeArea(dataset) : "",
    areaSource: areaNormalization ? getElectrodeAreaSource(dataset) : "",
    zRealAxisLabel,
    zNegImagAxisLabel,
    magnitudeAxisLabel,
    zRealScale: scaleForAxisLabel(dataset, zRealAxisLabel),
    zNegImagScale: scaleForAxisLabel(dataset, zNegImagAxisLabel),
    magnitudeScale: scaleForAxisLabel(dataset, magnitudeAxisLabel),
    resistanceScale: areaNormalization ? getEffectiveElectrodeArea(dataset) : 1
  };
}

function buildEisDisplaySeries(result) {
  const dataset = result?.dataset;
  if (!dataset) return null;
  const settings = getActiveGraphSettings(dataset);
  const info = eisDisplayInfo(dataset);
  const points = dataset.points || [];
  const fitted = result.fitted || [];
  const makeNyquist = (source) => source.map((point) => [
    point.zReal * info.zRealScale,
    point.zNegImag * info.zNegImagScale
  ]);
  const makeMagnitude = (source) => source.map((point) => [
    point.frequency,
    Math.hypot(point.zReal, point.zNegImag) * info.magnitudeScale
  ]);
  const makePhase = (source) => source.map((point) => [
    point.frequency,
    phaseDisplayValue(point)
  ]);
  return {
    result,
    dataset,
    projectId: dataset.id,
    projectName: getProjectName(dataset),
    settings,
    nyquist: {
      xLabel: info.zRealAxisLabel,
      yLabel: info.zNegImagAxisLabel,
      data: makeNyquist(points),
      fit: makeNyquist(fitted)
    },
    bodeMagnitude: {
      xLabel: t("frequencyHz"),
      yLabel: info.magnitudeAxisLabel,
      data: makeMagnitude(points),
      fit: makeMagnitude(fitted)
    },
    bodePhase: {
      xLabel: t("frequencyHz"),
      yLabel: phaseLabel(),
      data: makePhase(points),
      fit: makePhase(fitted)
    }
  };
}

function buildDrtDisplaySeries(result) {
  const dataset = result?.dataset;
  if (!dataset) return null;
  const drtUsesFrequency = drtXAxisMode() === "frequency";
  const drtScale = drtDisplayScale(dataset);
  const points = (result.tauGrid || [])
    .map((tau, index) => [
      drtUsesFrequency ? tauToFrequency(tau) : tau,
      (result.gamma?.[index] || 0) * drtScale
    ])
    .filter((point) => Number.isFinite(point[0]) && Number.isFinite(point[1]))
    .sort((a, b) => a[0] - b[0]);
  return {
    result,
    dataset,
    projectId: dataset.id,
    projectName: getProjectName(dataset),
    settings: getActiveGraphSettings(dataset),
    xLabel: drtXAxisLabel(),
    yLabel: drtYLabel(),
    curve: points
  };
}

function renderCharts(result) {
  const style = currentGraphStyle();
  const chartOptions = (options) => ({
    lineWidth: style.lineWidth,
    pointRadius: style.pointRadius,
    peakRadius: style.peakRadius,
    legendLineWidth: style.legendLineWidth,
    labelSize: style.labelSize,
    pointShape: style.pointShape,
    showGrid: style.showGrid,
    ...options
  });
  const points = result.dataset?.points || [];
  const fitted = result.fitted || [];
  const eisScale = displayScale(result.dataset);
  const fMin = Math.min(...points.map((point) => point.frequency));
  const fMax = Math.max(...points.map((point) => point.frequency));
  const expNyquist = points.map((point) => [point.zReal * eisScale, point.zNegImag * eisScale]);
  const fitNyquist = fitted.map((point) => [point.zReal * eisScale, point.zNegImag * eisScale]);
  const expMagnitude = points.map((point) => [point.frequency, Math.hypot(point.zReal, point.zNegImag) * eisScale]);
  const fitMagnitude = fitted.map((point) => [point.frequency, Math.hypot(point.zReal, point.zNegImag) * eisScale]);
  const expPhase = points.map((point) => [point.frequency, phaseDisplayValue(point)]);
  const fitPhase = fitted.map((point) => [point.frequency, phaseDisplayValue(point)]);
  const residualReal = (result.residuals || []).map((item) => [item.frequency, item.real * eisScale]);
  const residualImag = (result.residuals || []).map((item) => [item.frequency, item.negImag * eisScale]);
  updateDistributionTitle();

  drawEisOverlayCharts(chartOptions);
  drawDrtOverlayChart();

  drawLineChart(el.residualChart, [
    ...(state.showFit ? [
      { label: `${getProjectName(result.dataset)} Re`, projectId: result.dataset.id, points: residualReal, color: style.residualReal, point: false, line: true },
      { label: `${getProjectName(result.dataset)} -Im`, projectId: result.dataset.id, points: residualImag, color: style.residualImag, point: false, line: true }
    ] : [])
  ], chartOptions({
    chartKey: "residual",
    xLabel: t("frequencyHz"),
    yLabel: residualLabel(),
    xScale: "log",
    yScale: "linear",
    symmetricY: true
  }));
}

function drawEisOverlayCharts(chartOptions) {
  const results = analyzedResults();
  if (!results.length) {
    drawChartMessage(el.nyquistChart, t("loadDataset"));
    drawChartMessage(el.bodeMagnitudeChart, t("loadDataset"));
    drawChartMessage(el.bodePhaseChart, t("loadDataset"));
    return;
  }
  const nyquistSeries = [];
  const magnitudeSeries = [];
  const phaseSeries = [];
  const nyquistXValues = [];
  const nyquistYValues = [];
  const magnitudeYValues = [];
  const phaseYValues = [];

  results.forEach((result) => {
    const display = buildEisDisplaySeries(result);
    if (!display) return;
    const { dataset, settings, projectId, projectName } = display;
    const style = currentGraphStyle(dataset);
    const expNyquist = display.nyquist.data;
    const fitNyquist = display.nyquist.fit;
    const expMagnitude = display.bodeMagnitude.data;
    const fitMagnitude = display.bodeMagnitude.fit;
    const expPhase = display.bodePhase.data;
    const fitPhase = display.bodePhase.fit;

    if (settings.showData !== false) {
      nyquistXValues.push(...expNyquist.map((point) => point[0]));
      nyquistYValues.push(...expNyquist.map((point) => point[1]));
      magnitudeYValues.push(...expMagnitude.map((point) => point[1]));
      phaseYValues.push(...expPhase.map((point) => point[1]));
      nyquistSeries.push({
        label: `${projectName} ${t("data")}`,
        projectId,
        points: expNyquist,
        color: style.data,
        point: true,
        line: false,
        shape: style.pointShape,
        pointRadius: style.pointRadius
      });
      magnitudeSeries.push({
        label: `${projectName} ${t("data")}`,
        projectId,
        points: expMagnitude,
        color: style.data,
        point: true,
        line: false,
        shape: style.pointShape,
        pointRadius: style.pointRadius
      });
      phaseSeries.push({
        label: `${projectName} ${t("data")}`,
        projectId,
        points: expPhase,
        color: style.phaseData,
        point: true,
        line: false,
        shape: style.pointShape,
        pointRadius: style.pointRadius
      });
    }

    if (settings.showFit !== false && fitNyquist.length) {
      nyquistXValues.push(...fitNyquist.map((point) => point[0]));
      nyquistYValues.push(...fitNyquist.map((point) => point[1]));
      magnitudeYValues.push(...fitMagnitude.map((point) => point[1]));
      phaseYValues.push(...fitPhase.map((point) => point[1]));
      nyquistSeries.push({
        label: `${projectName} ${t("fit")}`,
        projectId,
        points: fitNyquist,
        color: style.fit,
        point: false,
        line: true,
        lineWidth: style.lineWidth,
        legendLineWidth: style.legendLineWidth
      });
      magnitudeSeries.push({
        label: `${projectName} ${t("fit")}`,
        projectId,
        points: fitMagnitude,
        color: style.fit,
        point: false,
        line: true,
        lineWidth: style.lineWidth,
        legendLineWidth: style.legendLineWidth
      });
      phaseSeries.push({
        label: `${projectName} ${t("fit")}`,
        projectId,
        points: fitPhase,
        color: style.phaseFit,
        point: false,
        line: true,
        lineWidth: style.lineWidth,
        legendLineWidth: style.legendLineWidth
      });
    }
  });

  drawLineChart(el.nyquistChart, nyquistSeries, chartOptions({
    chartKey: "nyquist",
    xLabel: zRealLabel(),
    yLabel: zNegImagLabel(),
    xScale: "linear",
    yScale: "linear",
    xDomain: positiveZeroDomain(nyquistXValues),
    yDomain: positiveZeroDomain(nyquistYValues)
  }));

  drawLineChart(el.bodeMagnitudeChart, magnitudeSeries, chartOptions({
    chartKey: "bodeMagnitude",
    xLabel: t("frequencyHz"),
    yLabel: magnitudeLabel(),
    xScale: "log",
    yScale: "log",
    yDomain: positiveLogMagnitudeDomain(magnitudeYValues)
  }));

  drawLineChart(el.bodePhaseChart, phaseSeries, chartOptions({
    chartKey: "bodePhase",
    xLabel: t("frequencyHz"),
    yLabel: phaseLabel(),
    xScale: "log",
    yScale: "linear",
    reverseY: false,
    yDomain: phaseAutoDomain(phaseYValues)
  }));
}

function analyzedResults() {
  return state.datasets.map((dataset) => dataset.result).filter(Boolean);
}

function drawDrtOverlayChart() {
  const results = analyzedResults();
  if (!results.length) {
    drawChartMessage(el.drtChart, t("loadDataset"));
    return;
  }
  const series = [];
  const domainValues = [];
  results.forEach((result) => {
    const display = buildDrtDisplaySeries(result);
    if (!display) return;
    const { dataset, settings, projectId, projectName } = display;
    const style = currentGraphStyle(dataset);
    const drtScale = drtDisplayScale(dataset);
    if (settings.showDrt !== false) {
      const points = display.curve;
      domainValues.push(...points.map((point) => point[0]));
      series.push({
        label: `${projectName} DRT`,
        projectId,
        points,
        color: style.gamma,
        point: false,
        line: true,
        lineWidth: style.lineWidth
      });
    }
    if (settings.showPeaks === true) {
      const drtUsesFrequency = drtXAxisMode() === "frequency";
      result.peaks.forEach((peak, peakIndex) => {
        const x = drtUsesFrequency ? peak.frequency : peak.tau;
        domainValues.push(x);
        series.push({
          label: `${projectName} ${t("peaks")}`,
          projectId,
          points: [[x, peak.gamma * drtScale]],
          color: style.peak,
          point: true,
          line: false,
          legend: peakIndex === 0,
          shape: style.pointShape,
          pointRadius: style.peakRadius
        });
      });
    }
  });
  if (!series.length) {
    drawChartMessage(el.drtChart, t("noSeries"));
    return;
  }
  const activeStyle = currentGraphStyle();
  drawLineChart(el.drtChart, series, {
    chartKey: "drt",
    xLabel: drtXAxisLabel(),
    yLabel: drtYLabel(),
    xScale: "log",
    yScale: "linear",
    xDomain: getDomain(domainValues, "log", false),
    forceZeroY: true,
    height: 368,
    margin: { left: 68, right: 26, top: 44, bottom: 54 },
    lineWidth: activeStyle.lineWidth,
    pointRadius: activeStyle.pointRadius,
    peakRadius: activeStyle.peakRadius,
    legendLineWidth: activeStyle.legendLineWidth,
    labelSize: activeStyle.labelSize,
    pointShape: activeStyle.pointShape,
    showGrid: activeStyle.showGrid
  });
}

function renderLog(result) {
  const projectName = getProjectName(result.dataset);
  const fit = result.circuitFit || {};
  const fittingStatus = getFittingStatus(result);
  const drtScale = drtDisplayScale(result.dataset);
  const drtUnit = drtYAxisUnitText();
  const lines = [
    `${t("projectName")}: ${projectName}`,
    `${t("originalFile")}: ${result.dataset.originalName || result.dataset.name}`,
    `Created: ${result.createdAt}`,
    environmentMessage(),
    `${t("currentFittingModel")}: ${circuitText(fit.model || getCircuitModel(result.dataset))}`,
    `${t("modelImplemented")}: ${fit.implemented ? t("yes") : "No"}`,
    `${t("fittingUpdated")}: ${fit.updated ? t("yes") : "No"}`,
    `Fitting status: ${fittingStatus}`,
    `${t("fitQuality")}: RMSE=${formatNumber(result.rmse)} ohm, normalized=${formatPercent(result.normalizedRmse)}`,
    ...(fit.experimental ? [`Warburg: ${t("experimental")}`] : []),
    `${t("inputImaginary")}: ${result.dataset.inputImaginaryColumn}`,
    `${t("points")}: ${result.dataset.points.length}`,
    `${t("tauGrid")}: ${result.tauGrid.length} nodes, ${formatNumber(Math.min(...result.tauGrid))} to ${formatNumber(Math.max(...result.tauGrid))} s`,
    `${t("observableTauWindow")}: ${formatNumber(result.observableTauRange[0])} to ${formatNumber(result.observableTauRange[1])} s`,
    `${t("rinfEstimate")}: ${formatNumber(result.rInf)} ohm`,
    `${t("lambda")}: ${formatNumber(result.lambda)} (${t(result.options.lambdaMode === "manual" ? "manual" : "auto")}, ${t("analysisMode")}: ${result.options.analysisMode || "balanced"})`,
    `Rohm / Rs: ${result.options.fixRs ? t("fixed") : t("free")}`,
    "Lambda note: Fit priority increases residual-fit emphasis, DRT smooth increases smoothness emphasis, Balanced keeps the L-curve choice.",
    `RMSE: ${formatNumber(result.rmse)} ohm`,
    `${t("normalizedRmse")}: ${formatPercent(result.normalizedRmse)}`,
    "",
    `${t("detectedPeaks")}:`,
    ...(
      result.peaks.length
        ? result.peaks.map((peak, index) =>
            `${projectName} ${index + 1}. ${peak.name || defaultPeakName(peak, index)} [${peak.source || "Auto"}], tau=${formatNumber(peak.tau)} s, f=${formatNumber(peak.frequency)} Hz, gamma=${formatNumber(peak.gamma * drtScale)} ${drtUnit}, R=${formatNumber(peak.resistance * drtScale)} ${drtUnit}, ${translatePeak(peak)}`
          )
        : [t("none")]
    )
  ];
  el.runLog.textContent = lines.join("\n");
}

function drawEmptyCharts() {
  [el.nyquistChart, el.bodeMagnitudeChart, el.bodePhaseChart, el.drtChart, el.residualChart].forEach((svg) => {
    drawChartMessage(svg, t("loadDataset"));
  });
}

function drawChartMessage(svg, message) {
  clearSvg(svg);
  svg.setAttribute("viewBox", "0 0 720 420");
  const text = svgEl("text", { x: 360, y: 210, "text-anchor": "middle", class: "empty-chart" });
  text.textContent = message;
  svg.appendChild(text);
}

function drawLineChart(svg, series, options) {
  clearSvg(svg);
  const width = Number(options.width) || 720;
  const height = Number(options.height) || 420;
  const margin = { left: 64, right: 24, top: 22, bottom: 56, ...(options.margin || {}) };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.dataset.chartKey = options.chartKey || "";
  svg.dataset.plotLeft = String(margin.left);
  svg.dataset.plotTop = String(margin.top);
  svg.dataset.plotRight = String(margin.left + plotWidth);
  svg.dataset.plotBottom = String(margin.top + plotHeight);
  svg.dataset.viewWidth = String(width);
  svg.dataset.viewHeight = String(height);

  const allPoints = series.flatMap((item) => item.points).filter((point) => Number.isFinite(point[0]) && Number.isFinite(point[1]));
  if (!allPoints.length) {
    drawChartMessage(svg, t("noSeries"));
    return;
  }

  const autoXDomain = options.xDomain || getDomain(allPoints.map((point) => point[0]), options.xScale, false);
  const autoYDomain = options.yDomain || getDomain(allPoints.map((point) => point[1]), options.yScale, options.forceZeroY, options.symmetricY);
  const xDomain = resolveAxisDomain(options.chartKey, "x", autoXDomain, options.xScale);
  const yDomain = resolveAxisDomain(options.chartKey, "y", autoYDomain, options.yScale);
  rememberChartDomain(options.chartKey, {
    xDomain,
    yDomain,
    autoXDomain,
    autoYDomain,
    xScale: options.xScale,
    yScale: options.yScale,
    xLabel: options.xLabel,
    yLabel: options.yLabel
  });
  const xMap = makeScale(xDomain, [margin.left, margin.left + plotWidth], options.xScale);
  const yRange = options.reverseY ? [margin.top, margin.top + plotHeight] : [margin.top + plotHeight, margin.top];
  const yMap = makeScale(yDomain, yRange, options.yScale);

  if (options.showGrid !== false) {
    drawGrid(svg, xDomain, yDomain, xMap, yMap, options, margin, plotWidth, plotHeight);
  }
  drawAxes(svg, xDomain, yDomain, xMap, yMap, options, margin, plotWidth, plotHeight, height);

  for (const item of series) {
    const filtered = item.points.filter((point) => point[0] > 0 || options.xScale !== "log");
    if (item.line && filtered.length > 1) {
      const pathData = filtered
        .map((point, index) => `${index === 0 ? "M" : "L"} ${xMap(point[0]).toFixed(2)} ${yMap(point[1]).toFixed(2)}`)
        .join(" ");
      svg.appendChild(svgEl("path", {
        d: pathData,
        stroke: item.color,
        class: "series-line",
        style: `stroke-width: ${item.lineWidth ?? options.lineWidth ?? 2.2}; fill: none;`
      }));
    }
    if (item.point) {
      filtered.forEach((point) => {
        drawPoint(svg, xMap(point[0]), yMap(point[1]), {
          radius: item.points.length === 1 ? (item.pointRadius ?? options.peakRadius ?? 5) : (item.pointRadius ?? options.pointRadius ?? 3.4),
          color: item.color,
          shape: item.shape || options.pointShape || "circle"
        });
      });
    }
  }

  drawLegend(svg, series, options);
}

function drawGrid(svg, xDomain, yDomain, xMap, yMap, options, margin, plotWidth, plotHeight) {
  const xTicks = makeTicks(xDomain, options.xScale, 6);
  const yTicks = makeTicks(yDomain, options.yScale, 6);

  xTicks.forEach((tick) => {
    const x = xMap(tick);
    svg.appendChild(svgEl("line", {
      x1: x,
      x2: x,
      y1: margin.top,
      y2: margin.top + plotHeight,
      class: "grid-line"
    }));
  });
  yTicks.forEach((tick) => {
    const y = yMap(tick);
    svg.appendChild(svgEl("line", {
      x1: margin.left,
      x2: margin.left + plotWidth,
      y1: y,
      y2: y,
      class: "grid-line"
    }));
  });
}

function drawAxes(svg, xDomain, yDomain, xMap, yMap, options, margin, plotWidth, plotHeight, height = 420) {
  const axis = svgEl("g", { class: "axis" });
  const x0 = margin.left;
  const y0 = margin.top + plotHeight;
  axis.appendChild(svgEl("rect", {
    x: x0,
    y: margin.top,
    width: plotWidth,
    height: plotHeight,
    fill: "none",
    class: "plot-frame"
  }));

  makeTicks(xDomain, options.xScale, 6).forEach((tick) => {
    const x = xMap(tick);
    axis.appendChild(svgEl("line", { x1: x, x2: x, y1: y0, y2: y0 + 5 }));
    const text = svgEl("text", { x, y: y0 + 22, "text-anchor": "middle" });
    text.textContent = formatAxis(tick, options.xScale);
    axis.appendChild(text);
  });

  makeTicks(yDomain, options.yScale, 6).forEach((tick) => {
    const y = yMap(tick);
    axis.appendChild(svgEl("line", { x1: x0 - 5, x2: x0, y1: y, y2: y }));
    const text = svgEl("text", { x: x0 - 10, y: y + 4, "text-anchor": "end" });
    text.textContent = formatAxis(tick, options.yScale);
    axis.appendChild(text);
  });

  const xLabel = svgEl("text", { x: margin.left + plotWidth / 2, y: height - 10, "text-anchor": "middle", class: "chart-label" });
  xLabel.textContent = options.xLabel;
  axis.appendChild(xLabel);

  const yLabel = svgEl("text", {
    x: 18,
    y: margin.top + plotHeight / 2,
    "text-anchor": "middle",
    class: "chart-label",
    transform: `rotate(-90 18 ${margin.top + plotHeight / 2})`
  });
  yLabel.textContent = options.yLabel;
  axis.appendChild(yLabel);
  axis.appendChild(svgEl("rect", {
    x: margin.left,
    y: y0,
    width: plotWidth,
    height: 50,
    fill: "transparent",
    class: "axis-hit-zone",
    "data-axis": "x",
    "data-chart": options.chartKey
  }));
  axis.appendChild(svgEl("rect", {
    x: 0,
    y: margin.top,
    width: margin.left,
    height: plotHeight,
    fill: "transparent",
    class: "axis-hit-zone",
    "data-axis": "y",
    "data-chart": options.chartKey
  }));
  svg.appendChild(axis);
}

function drawLegend(svg, series, options = {}) {
  const legendItems = series.filter((item) => item.legend !== false);
  if (!legendItems.length) return;
  const labelSize = clamp(Number(options.labelSize) || 12, 8, 20);
  const chartKey = options.chartKey || "";
  const legendGroups = groupLegendItemsByProject(legendItems);
  legendGroups.forEach((legendGroup, groupIndex) => {
    const position = getLegendPosition(svg, chartKey, legendGroup.projectId, groupIndex);
    const legend = svgEl("g", {
      class: "legend draggable-legend",
      transform: `translate(${position.x}, ${position.y})`,
      "data-chart": chartKey,
      "data-project-id": legendGroup.projectId,
      "data-x": String(position.x),
      "data-y": String(position.y),
      tabindex: "0",
      role: "group"
    });
    let maxWidth = 0;
    const rowHeight = Math.max(18, labelSize + 8);
    legendGroup.items.forEach((item, itemIndex) => {
      const y = itemIndex * rowHeight;
      const group = svgEl("g", { transform: `translate(0, ${y})` });
      if (item.line) {
        group.appendChild(svgEl("line", { x1: 0, x2: 18, y1: 0, y2: 0, stroke: item.color, "stroke-width": item.legendLineWidth ?? options.legendLineWidth ?? 3 }));
      }
      if (item.point) {
        drawPoint(group, 9, 0, {
          radius: Math.min(4.8, item.pointRadius ?? options.pointRadius ?? 3.4),
          color: item.color,
          shape: item.shape || options.pointShape || "circle"
        });
      }
      const text = svgEl("text", { x: 24, y: 4 });
      text.setAttribute("style", `font-size: ${labelSize}px;`);
      text.textContent = item.label;
      group.appendChild(text);
      legend.appendChild(group);
      maxWidth = Math.max(maxWidth, 24 + item.label.length * labelSize * 0.62);
    });
    legend.insertBefore(svgEl("rect", {
      x: -8,
      y: -12,
      width: Math.max(maxWidth + 16, 80),
      height: Math.max((legendGroup.items.length - 1) * rowHeight + 22, 22),
      fill: "transparent",
      class: "legend-hitbox"
    }), legend.firstChild);
    svg.appendChild(legend);
  });
}

function groupLegendItemsByProject(legendItems) {
  const groups = new Map();
  legendItems.forEach((item) => {
    const projectId = String(item.projectId || "default");
    if (!groups.has(projectId)) groups.set(projectId, { projectId, items: [] });
    groups.get(projectId).items.push(item);
  });
  return [...groups.values()];
}

function getLegendPosition(svg, chartKey, projectId, groupIndex) {
  const saved = getSavedLegendPosition(chartKey, projectId);
  if (saved) return saved;
  return getDefaultLegendPosition(svg, groupIndex);
}

function getSavedLegendPosition(chartKey, projectId) {
  const chartPositions = state.legendPositions[chartKey];
  if (!chartPositions || typeof chartPositions !== "object") return null;
  const saved = chartPositions[projectId];
  if (!saved || typeof saved !== "object") return null;
  const x = Number(saved.x);
  const y = Number(saved.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return { x, y };
}

function getDefaultLegendPosition(svg, groupIndex) {
  const plotLeft = Number(svg.dataset.plotLeft) || 64;
  const plotTop = Number(svg.dataset.plotTop) || 22;
  const plotRight = Number(svg.dataset.plotRight) || 696;
  const plotBottom = Number(svg.dataset.plotBottom) || 364;
  const columnWidth = Math.max(120, Math.min(180, (plotRight - plotLeft - 40) / 3));
  const rowHeight = 46;
  const x = plotLeft + 12 + (groupIndex % 3) * columnWidth;
  const y = plotTop + 18 + Math.floor(groupIndex / 3) * rowHeight;
  return {
    x: clamp(x, plotLeft + 8, plotRight - 100),
    y: clamp(y, plotTop + 14, plotBottom - 16)
  };
}

function rememberLegendPosition(chartKey, projectId, position) {
  if (!chartKey || !projectId) return;
  const chartPositions = state.legendPositions[chartKey];
  if (!chartPositions || typeof chartPositions !== "object" || Number.isFinite(Number(chartPositions.x))) {
    state.legendPositions[chartKey] = {};
  }
  state.legendPositions[chartKey][projectId] = position;
}

function removeLegendPositionsForProject(projectId) {
  if (!projectId) return;
  Object.values(state.legendPositions).forEach((chartPositions) => {
    if (chartPositions && typeof chartPositions === "object") delete chartPositions[projectId];
  });
}

function startLegendDrag(event) {
  const legend = event.target.closest?.(".draggable-legend");
  if (!legend) return;
  const svg = legend.closest("svg.chart");
  if (!svg) return;
  event.preventDefault();
  const point = svgPointFromEvent(svg, event);
  state.dragLegend = {
    chartKey: legend.dataset.chart || "",
    projectId: legend.dataset.projectId || "",
    svg,
    legend,
    startPoint: point,
    startX: Number(legend.dataset.x) || 0,
    startY: Number(legend.dataset.y) || 0
  };
  legend.setPointerCapture?.(event.pointerId);
}

function moveLegendDrag(event) {
  const drag = state.dragLegend;
  if (!drag) return;
  const point = svgPointFromEvent(drag.svg, event);
  const minX = Number(drag.svg.dataset.plotLeft) + 8;
  const maxX = Number(drag.svg.dataset.plotRight) - 80;
  const minY = Number(drag.svg.dataset.plotTop) + 14;
  const maxY = Number(drag.svg.dataset.plotBottom) - 12;
  const x = clamp(drag.startX + point.x - drag.startPoint.x, minX, maxX);
  const y = clamp(drag.startY + point.y - drag.startPoint.y, minY, maxY);
  drag.legend.dataset.x = String(x);
  drag.legend.dataset.y = String(y);
  drag.legend.setAttribute("transform", `translate(${x}, ${y})`);
  rememberLegendPosition(drag.chartKey, drag.projectId, { x, y });
}

function stopLegendDrag() {
  state.dragLegend = null;
}

function svgPointFromEvent(svg, event) {
  const box = svg.getBoundingClientRect();
  const viewWidth = Number(svg.dataset.viewWidth) || 720;
  const viewHeight = Number(svg.dataset.viewHeight) || 420;
  return {
    x: (event.clientX - box.left) * viewWidth / Math.max(box.width, 1),
    y: (event.clientY - box.top) * viewHeight / Math.max(box.height, 1)
  };
}

function drawPoint(parent, x, y, options) {
  const r = options.radius;
  const color = options.color;
  const shape = getAllowedPointShape(options.shape);
  if (shape === "square") {
    parent.appendChild(svgEl("rect", {
      x: x - r,
      y: y - r,
      width: r * 2,
      height: r * 2,
      fill: color,
      class: "series-point"
    }));
    return;
  }
  if (shape === "triangle") {
    parent.appendChild(svgEl("polygon", {
      points: `${x},${y - r * 1.15} ${x + r * 1.05},${y + r * 0.85} ${x - r * 1.05},${y + r * 0.85}`,
      fill: color,
      class: "series-point"
    }));
    return;
  }
  if (shape === "diamond") {
    parent.appendChild(svgEl("polygon", {
      points: `${x},${y - r * 1.2} ${x + r * 1.2},${y} ${x},${y + r * 1.2} ${x - r * 1.2},${y}`,
      fill: color,
      class: "series-point"
    }));
    return;
  }
  if (shape === "cross") {
    const group = svgEl("g", { class: "series-point cross-point" });
    group.appendChild(svgEl("line", { x1: x - r, x2: x + r, y1: y - r, y2: y + r, stroke: color, "stroke-width": 2 }));
    group.appendChild(svgEl("line", { x1: x - r, x2: x + r, y1: y + r, y2: y - r, stroke: color, "stroke-width": 2 }));
    parent.appendChild(group);
    return;
  }
  parent.appendChild(svgEl("circle", {
    cx: x,
    cy: y,
    r,
    fill: color,
    class: "series-point"
  }));
}

function positiveZeroDomain(values, multiplier = 1.5) {
  const clean = values.filter(Number.isFinite);
  const max = Math.max(...clean, 0);
  return [0, Math.max(max * multiplier, 1e-12)];
}

function positiveLogMagnitudeDomain(values) {
  const clean = values.filter((value) => Number.isFinite(value) && value > 0);
  if (!clean.length) return [1e-3, 1];
  const min = Math.min(...clean);
  const max = Math.max(...clean);
  if (min === max) return [min * 0.8, max * 1.5 || min * 1.5];
  return [min * 0.8, max * 1.5];
}

function phaseAutoDomain(values) {
  const clean = values.filter(Number.isFinite);
  if (!clean.length) return [-90, 0];
  const min = Math.min(...clean);
  const max = Math.max(...clean);
  if (min === max) {
    const pad = Math.max(Math.abs(min) * 0.2, 1);
    return [min - pad, max + pad];
  }
  if (max <= 0) return [min * 1.2, max * 0.8];
  if (min >= 0) return [min * 0.8, max * 1.2];
  const padding = (max - min) * 0.18;
  return [min - padding, max + padding];
}

function getDomain(values, scaleType, forceZero, symmetric) {
  let clean = values.filter(Number.isFinite);
  if (scaleType === "log") clean = clean.filter((value) => value > 0);
  let min = Math.min(...clean);
  let max = Math.max(...clean);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return scaleType === "log" ? [1, 10] : [0, 1];
  if (forceZero) min = Math.min(0, min);
  if (symmetric) {
    const bound = Math.max(Math.abs(min), Math.abs(max), 1e-12);
    min = -bound;
    max = bound;
  }
  if (min === max) {
    const pad = Math.abs(min || 1) * 0.1;
    min -= pad;
    max += pad;
  }
  if (scaleType === "log") {
    return [Math.pow(10, Math.floor(Math.log10(min))), Math.pow(10, Math.ceil(Math.log10(max)))];
  }
  const padding = (max - min) * 0.08;
  return [min - padding, max + padding];
}

function makeScale(domain, range, type) {
  if (type === "log") {
    const d0 = Math.log10(domain[0]);
    const d1 = Math.log10(domain[1]);
    return (value) => {
      const t = (Math.log10(Math.max(value, domain[0])) - d0) / (d1 - d0 || 1);
      return range[0] + t * (range[1] - range[0]);
    };
  }
  return (value) => {
    const t = (value - domain[0]) / (domain[1] - domain[0] || 1);
    return range[0] + t * (range[1] - range[0]);
  };
}

function makeTicks(domain, scaleType, count) {
  if (scaleType === "log") {
    const start = Math.ceil(Math.log10(domain[0]));
    const end = Math.floor(Math.log10(domain[1]));
    const ticks = [];
    for (let exp = start; exp <= end; exp += 1) ticks.push(Math.pow(10, exp));
    if (ticks.length > count) {
      const step = Math.ceil(ticks.length / count);
      return ticks.filter((_, index) => index % step === 0);
    }
    return ticks;
  }

  const [min, max] = domain;
  const rawStep = (max - min) / Math.max(count - 1, 1);
  const step = niceStep(rawStep);
  const first = Math.ceil(min / step) * step;
  const ticks = [];
  for (let value = first; value <= max + step * 0.5; value += step) ticks.push(value);
  return ticks;
}

function niceStep(raw) {
  const exponent = Math.floor(Math.log10(Math.abs(raw) || 1));
  const fraction = raw / Math.pow(10, exponent);
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return niceFraction * Math.pow(10, exponent);
}

function formatAxis(value) {
  return formatScientific(value);
}

function formatScientific(value, digits = 1) {
  if (!Number.isFinite(value)) return "-";
  if (Object.is(value, -0) || Math.abs(value) < 1e-14) return "0";
  const sign = value < 0 ? "-" : "";
  let abs = Math.abs(value);
  let exponent = Math.floor(Math.log10(abs));
  let mantissa = abs / Math.pow(10, exponent);
  const rounded = Number(mantissa.toFixed(digits));
  if (rounded >= 10) {
    mantissa = 1;
    exponent += 1;
  } else {
    mantissa = rounded;
  }
  return `${sign}${mantissa.toFixed(digits)}e${exponent}`;
}

function drtXyExportRows(results = analyzedResults()) {
  const rows = [["Project name", "X label", "X value", "Y label", "Y value"]];
  results.forEach((result) => {
    const display = buildDrtDisplaySeries(result);
    if (!display || display.settings.showDrt === false) return;
    display.curve.forEach(([xValue, yValue]) => {
      rows.push([display.projectName, display.xLabel, xValue, display.yLabel, yValue]);
    });
  });
  return rows;
}

function fitXyExportRows(results = analyzedResults()) {
  const rows = [["Project name", "Plot type", "X label", "X value", "Y label", "Y value"]];
  results.forEach((result) => {
    const display = buildEisDisplaySeries(result);
    if (!display || display.settings.showFit === false) return;
    appendFitXyRows(rows, display.projectName, "Nyquist fit", display.nyquist);
    appendFitXyRows(rows, display.projectName, "Bode magnitude fit", display.bodeMagnitude);
    appendFitXyRows(rows, display.projectName, "Bode phase fit", display.bodePhase);
  });
  return rows;
}

function appendFitXyRows(rows, projectName, plotType, plotSeries) {
  (plotSeries.fit || []).forEach(([xValue, yValue]) => {
    rows.push([projectName, plotType, plotSeries.xLabel, xValue, plotSeries.yLabel, yValue]);
  });
}

function exportDrtExcel() {
  const results = analyzedResults();
  const rows = drtXyExportRows(results);
  if (rows.length <= 1) {
    setStatus(t("noVisibleDrtData"));
    return;
  }
  const workbook = makeXlsxBlob([
    { name: "DRT_XY_Data", rows }
  ]);
  const filename = results.length === 1
    ? `${safeFileBase(getProjectName(results[0].dataset))}_DRT_XY_Data.xlsx`
    : "DRT_Compare_XY_Data.xlsx";
  downloadBlob(workbook, filename);
  setStatus(t("exportedDrtData"));
}

function exportFitDataExcel() {
  const results = analyzedResults();
  const rows = fitXyExportRows(results);
  if (rows.length <= 1) {
    setStatus(t("noVisibleFitData"));
    return;
  }
  const workbook = makeXlsxBlob([
    { name: "Fit_XY_Data", rows }
  ]);
  const filename = results.length === 1
    ? `${safeFileBase(getProjectName(results[0].dataset))}_Fit_XY_Data.xlsx`
    : "EIS_Compare_Fit_XY_Data.xlsx";
  downloadBlob(workbook, filename);
  setStatus(t("exportedFitData"));
}

function openFigureSaveDialog(chartKey) {
  if (!state.result || !getFigureSvg(chartKey)) return;
  state.figureDialog.chartKey = chartKey;
  el.figureSaveChartLabel.textContent = chartDisplayName(chartKey);
  el.figureFormatSelect.value = "pdf";
  if (typeof el.figureSaveDialog.showModal === "function") {
    el.figureSaveDialog.showModal();
  } else {
    el.figureSaveDialog.setAttribute("open", "");
  }
}

function closeFigureSaveDialog() {
  if (typeof el.figureSaveDialog.close === "function") {
    el.figureSaveDialog.close();
  } else {
    el.figureSaveDialog.removeAttribute("open");
  }
}

function saveSelectedFigure() {
  const chartKey = state.figureDialog.chartKey;
  const format = ["pdf", "svg", "png"].includes(el.figureFormatSelect.value) ? el.figureFormatSelect.value : "pdf";
  exportFigure(chartKey, format);
  closeFigureSaveDialog();
}

function exportFigure(chartKey, format) {
  if (!state.result) return;
  const sourceSvg = getFigureSvg(chartKey);
  if (!sourceSvg) return;
  const exportSvg = prepareSvgForExport(sourceSvg);
  const filename = figureExportFilename(chartKey, format);
  if (format === "svg") {
    const svgText = `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(exportSvg)}`;
    downloadBlob(new Blob([svgText], { type: "image/svg+xml;charset=utf-8" }), filename);
    return;
  }
  if (format === "pdf") {
    exportSvgAsPdf(exportSvg, filename);
    return;
  }
  exportSvgAsPng(exportSvg, filename);
}

function figureExportFilename(chartKey, format) {
  if (visibleProjectCountForFigure(chartKey) > 1) {
    const names = {
      nyquist: "EIS_compare_Nyquist",
      bodeMagnitude: "EIS_compare_Bode_magnitude",
      bodePhase: "EIS_compare_Bode_phase",
      drt: "DRT_compare"
    };
    return `${names[chartKey] || `EIS_DRT_compare_${figureSlug(chartKey)}`}.${format}`;
  }
  return `${safeFileBase(getProjectName(state.result.dataset))}_${figureSlug(chartKey)}.${format}`;
}

function visibleProjectCountForFigure(chartKey) {
  const results = analyzedResults();
  if (chartKey === "drt") {
    return results.filter((result) => getActiveGraphSettings(result.dataset).showDrt !== false).length;
  }
  if (["nyquist", "bodeMagnitude", "bodePhase"].includes(chartKey)) {
    return results.filter((result) => {
      const settings = getActiveGraphSettings(result.dataset);
      return settings.showData !== false || settings.showFit !== false;
    }).length;
  }
  return state.result ? 1 : 0;
}

function getFigureSvg(chartKey) {
  const figures = {
    nyquist: el.nyquistChart,
    bodeMagnitude: el.bodeMagnitudeChart,
    bodePhase: el.bodePhaseChart,
    drt: el.drtChart,
    residual: el.residualChart,
    circuit: el.circuitDiagram
  };
  return figures[chartKey] || null;
}

function figureSlug(chartKey) {
  const names = {
    nyquist: "Nyquist",
    bodeMagnitude: "Bode_magnitude",
    bodePhase: "Bode_phase",
    drt: "DRT",
    residual: "Relative_residual",
    circuit: "equivalent_circuit"
  };
  return names[chartKey] || "Figure";
}

function exportSvgAsPdf(exportSvg, filename) {
  const viewBox = exportSvg.getAttribute("viewBox")?.split(/\s+/).map(Number) || [0, 0, 720, 420];
  const width = viewBox[2] || 720;
  const height = viewBox[3] || 420;
  const svgText = new XMLSerializer().serializeToString(exportSvg);
  const svgBlob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  const image = new Image();
  image.onload = () => {
    const renderScale = 4;
    const canvas = document.createElement("canvas");
    canvas.width = width * renderScale;
    canvas.height = height * renderScale;
    const context = canvas.getContext("2d");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    const jpegData = canvas.toDataURL("image/jpeg", 0.96);
    const pdfBlob = makePdfFromJpeg(jpegData, width, height);
    downloadBlob(pdfBlob, filename);
  };
  image.onerror = () => URL.revokeObjectURL(url);
  image.src = url;
}

function makePdfFromJpeg(dataUrl, width, height) {
  const base64 = dataUrl.split(",")[1] || "";
  const imageBytes = base64ToBytes(base64);
  const pageWidth = width * 0.75;
  const pageHeight = height * 0.75;
  const drawCommand = `q ${formatPdfNumber(pageWidth)} 0 0 ${formatPdfNumber(pageHeight)} 0 0 cm /Im0 Do Q`;
  const drawBytes = asciiBytes(drawCommand);
  const objects = [
    { text: "<< /Type /Catalog /Pages 2 0 R >>" },
    { text: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
    { text: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${formatPdfNumber(pageWidth)} ${formatPdfNumber(pageHeight)}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>` },
    {
      header: `<< /Type /XObject /Subtype /Image /Width ${Math.round(width * 4)} /Height ${Math.round(height * 4)} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n`,
      binary: imageBytes,
      footer: "\nendstream"
    },
    {
      header: `<< /Length ${drawBytes.length} >>\nstream\n`,
      binary: drawBytes,
      footer: "\nendstream"
    }
  ];
  const parts = [];
  const offsets = [0];
  let offset = 0;
  const push = (part) => {
    const bytes = typeof part === "string" ? asciiBytes(part) : part;
    parts.push(bytes);
    offset += bytes.length;
  };

  push("%PDF-1.4\n");
  objects.forEach((object, index) => {
    offsets.push(offset);
    push(`${index + 1} 0 obj\n`);
    if (object.text) {
      push(object.text);
    } else {
      push(object.header);
      push(object.binary);
      push(object.footer);
    }
    push("\nendobj\n");
  });
  const xrefOffset = offset;
  push(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`);
  offsets.slice(1).forEach((itemOffset) => {
    push(`${String(itemOffset).padStart(10, "0")} 00000 n \n`);
  });
  push(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);
  return new Blob(parts, { type: "application/pdf" });
}

function formatPdfNumber(value) {
  return Number(value.toFixed(3)).toString();
}

function asciiBytes(text) {
  return new TextEncoder().encode(text);
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function exportSvgAsPng(exportSvg, filename) {
  const viewBox = exportSvg.getAttribute("viewBox")?.split(/\s+/).map(Number) || [0, 0, 720, 420];
  const width = viewBox[2] || 720;
  const height = viewBox[3] || 420;
  const svgText = new XMLSerializer().serializeToString(exportSvg);
  const svgBlob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  const image = new Image();
  image.onload = () => {
    const scale = 4;
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const context = canvas.getContext("2d");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, filename);
    }, "image/png");
  };
  image.onerror = () => URL.revokeObjectURL(url);
  image.src = url;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function prepareSvgForExport(sourceSvg) {
  const clone = sourceSvg.cloneNode(true);
  clone.setAttribute("xmlns", SVG_NS);
  const viewBox = clone.getAttribute("viewBox") || "0 0 720 420";
  const [, , width = 720, height = 420] = viewBox.split(/\s+/).map(Number);
  const card = sourceSvg.closest(".chart-card");
  const cardStyle = card ? getComputedStyle(card) : null;
  const svgStyle = getComputedStyle(sourceSvg);
  const background = cardStyle?.backgroundColor || "#ffffff";
  const chartMuted = svgStyle.getPropertyValue("--chart-muted").trim() || "#667085";
  const chartAxis = svgStyle.getPropertyValue("--chart-axis").trim() || "#dfe5e1";
  const chartGrid = svgStyle.getPropertyValue("--chart-grid").trim() || "#dfe5e1";
  const chartPointStroke = svgStyle.getPropertyValue("--chart-point-stroke").trim() || "#ffffff";
  const labelSize = getProjectLabelSize(state.result?.dataset);
  const style = svgEl("style");
  style.textContent = `
    .export-title{fill:#111827;font:700 14px Arial, sans-serif;}
    .axis text,.chart-label{fill:${chartMuted};font:12px Arial, sans-serif;}
    .legend text{fill:${chartMuted};font:${labelSize}px Arial, sans-serif;}
    .axis line,.axis path{stroke:${chartAxis};stroke-width:1;}
    .plot-frame{fill:none;stroke:${chartAxis};stroke-width:1.4;}
    .grid-line{stroke:${chartGrid};stroke-width:1;}
    .axis-hit-zone{display:none;}
    .series-line{fill:none;}
    .series-point{stroke:${chartPointStroke};stroke-width:1;}
    .empty-chart{fill:${chartMuted};font:14px Arial, sans-serif;}
    .circuit-wire{stroke:#111827;stroke-width:2;fill:none;stroke-linecap:round;}
    .circuit-element{fill:#ffffff;stroke:#111827;stroke-width:1.5;}
    .circuit-label{fill:#111827;font:13px Arial, sans-serif;}
  `;
  clone.insertBefore(style, clone.firstChild);
  clone.insertBefore(svgEl("rect", { x: 0, y: 0, width, height, fill: background }), style);
  if (sourceSvg !== el.circuitDiagram) {
    const title = svgEl("text", { x: width / 2, y: 16, "text-anchor": "middle", class: "export-title" });
    title.textContent = chartDisplayName(sourceSvg.dataset.chartKey);
    clone.insertBefore(title, style.nextSibling);
  }
  return clone;
}

function makeXlsxBlob(sheets) {
  const files = [
    {
      name: "[Content_Types].xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  ${sheets.map((_, index) => `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}
</Types>`
    },
    {
      name: "_rels/.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
    },
    {
      name: "xl/workbook.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    ${sheets.map((sheet, index) => `<sheet name="${escapeXml(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`).join("")}
  </sheets>
</workbook>`
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${sheets.map((_, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`).join("")}
  <Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`
    },
    {
      name: "xl/styles.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>
  <fills count="1"><fill><patternFill patternType="none"/></fill></fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellXfs>
</styleSheet>`
    },
    ...sheets.map((sheet, index) => ({
      name: `xl/worksheets/sheet${index + 1}.xml`,
      content: worksheetXml(sheet.rows)
    }))
  ];
  return makeZip(files);
}

function worksheetXml(rows) {
  const rowXml = rows.map((row, rowIndex) => {
    const cells = row.map((value, colIndex) => cellXml(value, rowIndex + 1, colIndex + 1)).join("");
    return `<row r="${rowIndex + 1}">${cells}</row>`;
  }).join("");
  const maxCols = Math.max(...rows.map((row) => row.length), 1);
  const ref = `A1:${columnName(maxCols)}${Math.max(rows.length, 1)}`;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="${ref}"/>
  <sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
  <sheetData>${rowXml}</sheetData>
  <autoFilter ref="${ref}"/>
</worksheet>`;
}

function cellXml(value, row, column) {
  if (value === null || value === undefined || value === "") return "";
  const ref = `${columnName(column)}${row}`;
  if (typeof value === "number" && Number.isFinite(value)) return `<c r="${ref}"><v>${value}</v></c>`;
  return `<c r="${ref}" t="inlineStr"><is><t>${escapeXml(String(value))}</t></is></c>`;
}

function columnName(index) {
  let name = "";
  let n = index;
  while (n > 0) {
    const remainder = (n - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    n = Math.floor((n - 1) / 26);
  }
  return name;
}

function makeZip(files) {
  const encoder = new TextEncoder();
  const chunks = [];
  const central = [];
  let offset = 0;
  const now = new Date();
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
  const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

  files.forEach((file) => {
    const nameBytes = encoder.encode(file.name);
    const dataBytes = typeof file.content === "string" ? encoder.encode(file.content) : file.content;
    const crc = crc32(dataBytes);
    const local = new Uint8Array(30);
    const localView = new DataView(local.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, dosTime, true);
    localView.setUint16(12, dosDate, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, dataBytes.length, true);
    localView.setUint32(22, dataBytes.length, true);
    localView.setUint16(26, nameBytes.length, true);
    localView.setUint16(28, 0, true);
    chunks.push(local, nameBytes, dataBytes);

    central.push({ nameBytes, crc, size: dataBytes.length, offset });
    offset += local.length + nameBytes.length + dataBytes.length;
  });

  const centralOffset = offset;
  central.forEach((entry) => {
    const header = new Uint8Array(46);
    const view = new DataView(header.buffer);
    view.setUint32(0, 0x02014b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 20, true);
    view.setUint16(8, 0, true);
    view.setUint16(10, 0, true);
    view.setUint16(12, dosTime, true);
    view.setUint16(14, dosDate, true);
    view.setUint32(16, entry.crc, true);
    view.setUint32(20, entry.size, true);
    view.setUint32(24, entry.size, true);
    view.setUint16(28, entry.nameBytes.length, true);
    view.setUint16(30, 0, true);
    view.setUint16(32, 0, true);
    view.setUint16(34, 0, true);
    view.setUint16(36, 0, true);
    view.setUint32(38, 0, true);
    view.setUint32(42, entry.offset, true);
    chunks.push(header, entry.nameBytes);
    offset += header.length + entry.nameBytes.length;
  });

  const centralSize = offset - centralOffset;
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(4, 0, true);
  endView.setUint16(6, 0, true);
  endView.setUint16(8, central.length, true);
  endView.setUint16(10, central.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, centralOffset, true);
  endView.setUint16(20, 0, true);
  chunks.push(end);

  const zipBytes = new Uint8Array(chunks.reduce((sum, chunk) => sum + chunk.length, 0));
  let cursor = 0;
  chunks.forEach((chunk) => {
    zipBytes.set(chunk, cursor);
    cursor += chunk.length;
  });
  return new Blob([zipBytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

let crcTable = null;

function crc32(bytes) {
  if (!crcTable) {
    crcTable = Array.from({ length: 256 }, (_, index) => {
      let c = index;
      for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      return c >>> 0;
    });
  }
  let crc = 0xffffffff;
  bytes.forEach((byte) => {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  });
  return (crc ^ 0xffffffff) >>> 0;
}

function safeFileBase(name) {
  return (name || "drt")
    .replace(/\.[^/.]+$/, "")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "_")
    .trim() || "drt";
}

function makeSampleData() {
  const frequencies = logspace(5, -1, 60);
  const elements = defaultCircuitElements();
  const params = {
    Rs: 0.5,
    R1: 2.0,
    Q1: 1e-3,
    n1: 0.9,
    R2: 5.0,
    Q2: 5e-2,
    n2: 0.85
  };
  const lines = ["frequency_hz,zreal_ohm,zimag_ohm"];
  frequencies.forEach((frequency, index) => {
    const z = circuitImpedanceAt(frequency, elements, params);
    const magnitude = Math.hypot(z.re, z.im);
    const noise = (Math.sin(index * 1.7) + Math.cos(index * 0.6)) * magnitude * 0.0035;
    lines.push(`${frequency.toExponential(8)},${(z.re + noise).toExponential(8)},${(z.im - noise * 0.25).toExponential(8)}`);
  });
  return lines.join("\n");
}

function solveLinearSystem(matrix, rhs) {
  const n = rhs.length;
  for (let col = 0; col < n; col += 1) {
    let pivotRow = col;
    let pivotAbs = Math.abs(matrix[col][col]);
    for (let row = col + 1; row < n; row += 1) {
      const candidate = Math.abs(matrix[row][col]);
      if (candidate > pivotAbs) {
        pivotAbs = candidate;
        pivotRow = row;
      }
    }
    if (pivotAbs < 1e-14) matrix[col][col] += 1e-10;
    if (pivotRow !== col) {
      [matrix[col], matrix[pivotRow]] = [matrix[pivotRow], matrix[col]];
      [rhs[col], rhs[pivotRow]] = [rhs[pivotRow], rhs[col]];
    }
    const pivot = matrix[col][col];
    for (let row = col + 1; row < n; row += 1) {
      const factor = matrix[row][col] / pivot;
      if (!Number.isFinite(factor)) continue;
      matrix[row][col] = 0;
      for (let j = col + 1; j < n; j += 1) {
        matrix[row][j] -= factor * matrix[col][j];
      }
      rhs[row] -= factor * rhs[col];
    }
  }

  const x = Array(n).fill(0);
  for (let row = n - 1; row >= 0; row -= 1) {
    let sum = rhs[row];
    for (let col = row + 1; col < n; col += 1) sum -= matrix[row][col] * x[col];
    x[row] = sum / matrix[row][row];
    if (!Number.isFinite(x[row])) x[row] = 0;
  }
  return x;
}

function matVec(matrix, vector) {
  return matrix.map((row) => row.reduce((sum, value, index) => sum + value * vector[index], 0));
}

function roughness(vector) {
  let sum = 0;
  for (let i = 0; i < vector.length - 2; i += 1) {
    const value = vector[i] - 2 * vector[i + 1] + vector[i + 2];
    sum += value * value;
  }
  return Math.sqrt(sum);
}

function vectorNorm(vector) {
  return Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
}

function makeMatrix(rows, cols, value) {
  return Array.from({ length: rows }, () => Array(cols).fill(value));
}

function logspace(minExp, maxExp, count) {
  if (count <= 1) return [Math.pow(10, minExp)];
  return Array.from({ length: count }, (_, index) => {
    const t = index / (count - 1);
    return Math.pow(10, minExp + (maxExp - minExp) * t);
  });
}

function median(values) {
  const clean = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!clean.length) return 0;
  const middle = Math.floor(clean.length / 2);
  return clean.length % 2 ? clean[middle] : (clean[middle - 1] + clean[middle]) / 2;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return "-";
  const abs = Math.abs(value);
  if ((abs > 0 && abs < 0.001) || abs >= 10000) return value.toExponential(2);
  if (abs < 1) return value.toPrecision(3);
  if (abs < 100) return value.toFixed(3).replace(/\.?0+$/, "");
  return value.toFixed(1);
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return "-";
  return `${(value * 100).toFixed(2)}%`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function svgEl(name, attributes = {}) {
  const node = document.createElementNS(SVG_NS, name);
  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== undefined && value !== null) node.setAttribute(key, String(value));
  });
  return node;
}

function clearSvg(svg) {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
}

function appendLog(message) {
  el.runLog.textContent = `${el.runLog.textContent}\n${message}`.trim();
}
