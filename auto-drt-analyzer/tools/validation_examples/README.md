# Auto DRT Analyzer validation examples

These files are noiseless synthetic EIS datasets with known equivalent-circuit parameters.
Use them to check that DRT peak positions and approximate integrated resistances are reasonable.

## Files

- `rs_r1c1_single_arc.csv`: one ideal RC arc.
- `rs_two_rc_two_arcs.csv`: two separated ideal RC arcs.
- `rs_r1cpe1_depressed_arc.csv`: one depressed R-CPE arc.
- `expected_peaks.csv`: expected characteristic tau/frequency and resistance values.

## Suggested validation procedure

1. Open one CSV in Auto DRT Analyzer.
2. Analyze with full calculation frequency range.
3. Use automatic λ first, then compare manual λ values if needed.
4. Compare DRT peak tau/frequency against `expected_peaks.csv`.
5. For ideal RC examples, the integrated DRT resistance should be close to the expected resistance.

These examples are not a full certification suite. They are sanity checks for solver behavior,
regularization settings, and peak detection. Real experimental data still require independent
validation of EIS quality, equivalent-circuit assumptions, and DRT parameters.
