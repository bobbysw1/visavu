# NEEDS_REVIEW — visa-data cases needing human verification

These are the 19 cells the regression matrix flagged as **NEEDS_REVIEW** —
either the official source is ambiguous, the policy has changed recently,
or eligibility depends on factors (passport type, residence status) that
the matrix can't encode cleanly.

**What "review" means here:** open the source URL in the right column,
read the current published policy, then either:

1. **Confirm the data is right** → reply with the row number and "confirmed"
2. **Update the data** → reply with row number + the correct status
3. **Mark this as genuinely contested** → keep NEEDS_REVIEW, add a note

These do NOT block the deploy gate (NEEDS_REVIEW rows are excluded from
the pass/fail denominator). But sorting them improves the dataset
quality and reduces user reports.

---

## Tier 1 (1 case)

| # | Route | Why ambiguous | Source URL |
|---|---|---|---|
| 1 | IN → SG | Singapore extended visa-free entry to Indians under tight conditions (transit, group tour) — not general tourism. The data shows embassy_visa which is the conservative default. | https://www.ica.gov.sg/enter-transit-depart/entering-singapore/visa_requirements |

## Tier 2 (18 cases)

| # | Route | Why ambiguous / current data | Source URL |
|---|---|---|---|
| 2 | ZA → AE | South Africa to UAE: bilateral has flipped between VF, e-visa, and embassy several times in 2 years | https://u.ae/en/information-and-services/visa-and-emirates-id |
| 3 | ZA → JP | Data shows e_visa; common knowledge says embassy. Japan's e-Visa scheme is limited — may not cover ZA | https://www.mofa.go.jp/j_info/visit/visa/index.html |
| 4 | MX → CA | Canada partial visa reintroduction Feb 2024 — eligible Mexican travellers can still use eTA, depends on prior visa/work-permit history | https://www.canada.ca/en/immigration-refugees-citizenship/news/2024/02/mexico-visa-requirement.html |
| 5 | EG → KR | K-ETA scope for Egypt unclear — data shows visa-free with eTA but K-ETA is restricted to ~110 nationalities | https://www.k-eta.go.kr/ |
| 6 | EG → SG | Data shows visa-free but my prior expected was embassy. SG's visa-required list does include EG | https://www.ica.gov.sg/enter-transit-depart/entering-singapore/visa_requirements |
| 7 | EG → IN | Data shows embassy; Egypt is on India's e-visa eligible list. Wikipedia may have stale data | https://indianvisaonline.gov.in/evisa/ |
| 8 | EG → BR | EG-BR bilateral; data shows embassy. Brazil's visa policy for Egyptian passport unclear | https://www.gov.br/mre/en-us/consular-portal/visas/ |
| 9 | KE → BR | KE-BR bilateral; data shows embassy. Reciprocal arrangements vary | https://www.gov.br/mre/en-us/consular-portal/visas/ |
| 10 | GH → SG | Data shows visa-free; common knowledge says embassy. SG visa-required for GH | https://www.ica.gov.sg/enter-transit-depart/entering-singapore/visa_requirements |
| 11 | GH → BR | GH-BR bilateral; data shows embassy | https://www.gov.br/mre/en-us/consular-portal/visas/ |
| 12 | MA → CN | No tourism row in dataset — Morocco-China bilateral was VF for tourism (90 days) historically but policy may have changed | https://www.fmprc.gov.cn/eng/ |
| 13 | MA → SG | Data shows visa-free; common knowledge says embassy | https://www.ica.gov.sg/enter-transit-depart/entering-singapore/visa_requirements |
| 14 | MA → TH | Data shows visa-free; common knowledge says embassy | https://www.mfa.go.th/en/ |
| 15 | TR → IN | Data shows embassy; Turkey is on India's e-visa list | https://indianvisaonline.gov.in/evisa/ |
| 16 | TR → AE | TR-AE bilateral; data shows e_visa, my prior expected was visa-free | https://u.ae/en/information-and-services/visa-and-emirates-id |
| 17 | VN → BR | VN-BR bilateral; data shows embassy | https://www.gov.br/mre/en-us/consular-portal/visas/ |
| 18 | TH → ZA | ZA-TH bilateral; data shows visa-free, my prior expected was embassy | https://www.dha.gov.za/ |
| 19 | ID → JP | Japan grants 15-day visa-free for Indonesian e-passport holders (pre-registered) — paper passport holders still need embassy | https://www.mofa.go.jp/ |
| 20 | ID → ZA | No tourism row in dataset for ID → ZA | https://www.dha.gov.za/ |

---

## How to reply

Format: `row N: confirmed | update to STATUS | keep NEEDS_REVIEW: reason`

Example:
```
row 1: keep NEEDS_REVIEW: SG VF for IN is conditional on transit/group only — best to leave conservative
row 3: update to EMB
row 4: confirmed
```

I'll apply the updates to either `dataAccuracyMatrix.ts` (the expected
values) or `data_corrections.ts` (the actual visa_options row), re-run
the matrix, rebuild the snapshot, and push.
