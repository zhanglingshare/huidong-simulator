# Public evidence protocol — v2.1

The reference indicator feed is separate from the synthetic scenario engine. No official figure changes a simulation path, sensitivity, or model parameter without a later independent model-calibration approval.

- `latest.json`: latest verified reference indicators and collected document metadata.
- `history/`: immutable per-update snapshots.
- `reviews/`: the sourced manual review patch that can be re-applied after source updates.
- `sources.json`: official pages eligible for document-change monitoring (not automatic economic fact extraction).

The Hainan GDP is RMB, Singapore GDP is SGD; port cargo in tonnes is not the same unit as containers in TEU; Hainan resident population at year-end does not use the same boundary/date as Singapore total population at end-June. Never chart them as if directly comparable.

Every official indicator has a source URL, coverage period, unit, definition, grade, review author tag, date, and explicit `model_impact=none`. Singapore GDP comes from a rolling official table, which may be revised. `reviewed_by=official-primary-source-check` records assistant cross-check, **not a human subject-matter validation**. Published dates of continuously updated web tables are accompanied by notes instead of asserted exact web-update timestamps.

For each future update, require: change detection -> document citation -> evidence review -> human or designated editorial signoff -> new `history/` version -> `latest.json`; model recalibration is separately versioned and independently tested.
