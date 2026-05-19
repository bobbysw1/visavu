# Passport-cover audit — 2026-05-19

Total countries: 250
  - REAL_COVER:  235 (94%)
  - FLAG_ONLY:   6 (2%)
  - MISSING:     9 (4%)

Refresh covers: `npm run fetch:passport-covers` — pulls from Wikimedia Commons.
For one-off fixes / unusual countries, hand-add to the fetcher script's CURATED_OVERRIDES table with the Commons File: URL.

## MISSING — 9 countries (no image, generic placeholder rendering)

| iso2 | Country | Notes |
|---|---|---|
| AQ | Antarctica | no file on disk — flag-tile fallback in UI |
| BV | Bouvet Island | no file on disk — flag-tile fallback in UI |
| IO | British Indian Ocean Territory | no file on disk — flag-tile fallback in UI |
| TF | French Southern Territories | no file on disk — flag-tile fallback in UI |
| HM | Heard Island and McDonald Islands | no file on disk — flag-tile fallback in UI |
| PN | Pitcairn | no file on disk — flag-tile fallback in UI |
| SX | Sint Maarten (Dutch) | no file on disk — flag-tile fallback in UI |
| GS | South Georgia and the South Sandwich Islands | no file on disk — flag-tile fallback in UI |
| UM | United States Minor Outlying Islands | no file on disk — flag-tile fallback in UI |

## FLAG_ONLY — 6 countries (flag fallback rendering, no passport photo)

| iso2 | Country | Notes |
|---|---|---|
| GU | Guam | flag SVG only — needs real cover |
| MG | Madagascar | flag SVG only — needs real cover |
| MP | Northern Mariana Islands | flag SVG only — needs real cover |
| PR | Puerto Rico | flag SVG only — needs real cover |
| RS | Serbia | flag SVG only — needs real cover |
| SI | Slovenia | flag SVG only — needs real cover |

## REAL_COVER — 235 countries (Wikimedia Commons photo)

| iso2 | Country | Source |
|---|---|---|
| AF | Afghanistan | en.wikipedia.org/wiki/Afghan_passport |
| AX | Åland Islands | commons.wikimedia.org/wiki/Category:Pass |
| AL | Albania | en.wikipedia.org/wiki/Albanian_passport |
| DZ | Algeria | en.wikipedia.org/wiki/Algerian_passport |
| AS | American Samoa | commons.wikimedia.org/wiki/Special:Searc |
| AD | Andorra | en.wikipedia.org/wiki/Andorran_passport |
| AO | Angola | commons.wikimedia.org/wiki/Category:Pass |
| AI | Anguilla | en.wikipedia.org/wiki/Anguillian_passpor |
| AG | Antigua and Barbuda | en.wikipedia.org/wiki/Antiguan_and_Barbu |
| AR | Argentina | en.wikipedia.org/wiki/Argentine_passport |
| AM | Armenia | en.wikipedia.org/wiki/Armenian_passport |
| AW | Aruba | commons.wikimedia.org/wiki/Special:Searc |
| AU | Australia | en.wikipedia.org/wiki/Australian_passpor |
| AT | Austria | en.wikipedia.org/wiki/Austrian_passport |
| AZ | Azerbaijan | en.wikipedia.org/wiki/Azerbaijani_passpo |
| BS | Bahamas | commons.wikimedia.org/wiki/Special:Searc |
| BH | Bahrain | en.wikipedia.org/wiki/Bahraini_passport |
| BD | Bangladesh | en.wikipedia.org/wiki/Bangladeshi_passpo |
| BB | Barbados | commons.wikimedia.org/wiki/Category:Pass |
| BY | Belarus | en.wikipedia.org/wiki/Belarusian_passpor |
| BE | Belgium | en.wikipedia.org/wiki/Belgian_passport |
| BZ | Belize | commons.wikimedia.org/wiki/Category:Pass |
| BJ | Benin | en.wikipedia.org/wiki/Beninese_passport |
| BM | Bermuda | en.wikipedia.org/wiki/British_passport_( |
| BT | Bhutan | commons.wikimedia.org/wiki/Category:Pass |
| BO | Bolivia | en.wikipedia.org/wiki/Bolivian_passport |
| BQ | Bonaire, Sint Eustatius and Saba | en.wikipedia.org/wiki/Dutch_passport |
| BA | Bosnia and Herzegovina | commons.wikimedia.org/wiki/Category:Pass |
| BW | Botswana | commons.wikimedia.org/wiki/Special:Searc |
| BR | Brazil | en.wikipedia.org/wiki/Brazilian_passport |
| VG | British Virgin Islands | commons.wikimedia.org/wiki/Category:Pass |
| BN | Brunei Darussalam | en.wikipedia.org/wiki/Bruneian_passport |
| BG | Bulgaria | en.wikipedia.org/wiki/Bulgarian_passport |
| BF | Burkina Faso | commons.wikimedia.org/wiki/Category:Pass |
| BI | Burundi | en.wikipedia.org/wiki/Burundian_passport |
| CV | Cabo Verde | commons.wikimedia.org/wiki/Special:Searc |
| KH | Cambodia | en.wikipedia.org/wiki/Cambodian_passport |
| CM | Cameroon | en.wikipedia.org/wiki/Cameroonian_passpo |
| CA | Canada | commons.wikimedia.org/wiki/Category:Pass |
| KY | Cayman Islands | en.wikipedia.org/wiki/British_passport_( |
| CF | Central African Republic | en.wikipedia.org/wiki/Central_African_pa |
| TD | Chad | commons.wikimedia.org/wiki/Category:Pass |
| CL | Chile | commons.wikimedia.org/wiki/Category:Pass |
| CN | China | en.wikipedia.org/wiki/Chinese_passport |
| CX | Christmas Island | en.wikipedia.org/wiki/Australian_passpor |
| CC | Cocos (Keeling) Islands | en.wikipedia.org/wiki/Australian_passpor |
| CO | Colombia | en.wikipedia.org/wiki/Colombian_passport |
| KM | Comoros | commons.wikimedia.org/wiki/Category:Pass |
| CG | Congo | commons.wikimedia.org/wiki/Special:Searc |
| CD | Congo (DRC) | commons.wikimedia.org/wiki/Special:Searc |
| CK | Cook Islands | commons.wikimedia.org/wiki/Category:Pass |
| CR | Costa Rica | en.wikipedia.org/wiki/Costa_Rican_passpo |
| CI | Côte d'Ivoire | commons.wikimedia.org/wiki/Special:Searc |
| HR | Croatia | en.wikipedia.org/wiki/Croatian_passport |
| CU | Cuba | en.wikipedia.org/wiki/Cuban_passport |
| CW | Curaçao | commons.wikimedia.org/wiki/Special:Searc |
| CY | Cyprus | en.wikipedia.org/wiki/Cypriot_passport |
| CZ | Czechia | en.wikipedia.org/wiki/Czech_passport |
| DK | Denmark | en.wikipedia.org/wiki/Danish_passport |
| DJ | Djibouti | en.wikipedia.org/wiki/Djiboutian_passpor |
| DM | Dominica | commons.wikimedia.org/wiki/Category:Pass |
| DO | Dominican Republic | commons.wikimedia.org/wiki/Category:Pass |
| EC | Ecuador | en.wikipedia.org/wiki/Ecuadorian_passpor |
| EG | Egypt | en.wikipedia.org/wiki/Egyptian_passport |
| SV | El Salvador | commons.wikimedia.org/wiki/Special:Searc |
| GQ | Equatorial Guinea | commons.wikimedia.org/wiki/Category:Pass |
| ER | Eritrea | en.wikipedia.org/wiki/Eritrean_passport |
| EE | Estonia | en.wikipedia.org/wiki/Estonian_passport |
| SZ | Eswatini | commons.wikimedia.org/wiki/Category:Pass |
| ET | Ethiopia | en.wikipedia.org/wiki/Ethiopian_passport |
| FK | Falkland Islands | commons.wikimedia.org/wiki/Category:Pass |
| FO | Faroe Islands | en.wikipedia.org/wiki/Danish_passport |
| FJ | Fiji | commons.wikimedia.org/wiki/Special:Searc |
| FI | Finland | commons.wikimedia.org/wiki/Category:Pass |
| FR | France | en.wikipedia.org/wiki/French_passport |
| GF | French Guiana | commons.wikimedia.org/wiki/Special:Searc |
| PF | French Polynesia | commons.wikimedia.org/wiki/Special:Searc |
| GA | Gabon | en.wikipedia.org/wiki/Gabonese_passport |
| GM | Gambia | commons.wikimedia.org/wiki/Special:Searc |
| GE | Georgia | en.wikipedia.org/wiki/Georgian_passport |
| DE | Germany | en.wikipedia.org/wiki/German_passport |
| GH | Ghana | en.wikipedia.org/wiki/Ghanaian_passport |
| GI | Gibraltar | en.wikipedia.org/wiki/British_passport_( |
| GR | Greece | commons.wikimedia.org/wiki/Category:Pass |
| GL | Greenland | en.wikipedia.org/wiki/Danish_passport |
| GD | Grenada | en.wikipedia.org/wiki/Grenadian_passport |
| GP | Guadeloupe | commons.wikimedia.org/wiki/Special:Searc |
| GT | Guatemala | commons.wikimedia.org/wiki/Category:Pass |
| GG | Guernsey | en.wikipedia.org/wiki/Guernsey-variant_B |
| GN | Guinea | en.wikipedia.org/wiki/Guinean_passport |
| GW | Guinea-Bissau | commons.wikimedia.org/wiki/Category:Pass |
| GY | Guyana | commons.wikimedia.org/wiki/Category:Pass |
| HT | Haiti | commons.wikimedia.org/wiki/Category:Pass |
| HN | Honduras | en.wikipedia.org/wiki/Honduran_passport |
| HK | Hong Kong | commons.wikimedia.org/wiki/Category:Pass |
| HU | Hungary | en.wikipedia.org/wiki/Hungarian_passport |
| IS | Iceland | en.wikipedia.org/wiki/Icelandic_passport |
| IN | India | en.wikipedia.org/wiki/Indian_passport |
| ID | Indonesia | en.wikipedia.org/wiki/Indonesian_passpor |
| IR | Iran | en.wikipedia.org/wiki/Iranian_passport |
| IQ | Iraq | en.wikipedia.org/wiki/Iraqi_passport |
| IE | Ireland | en.wikipedia.org/wiki/Irish_passport |
| IM | Isle of Man | en.wikipedia.org/wiki/Isle_of_Man-varian |
| IL | Israel | en.wikipedia.org/wiki/Israeli_passport |
| IT | Italy | en.wikipedia.org/wiki/Italian_passport |
| JM | Jamaica | en.wikipedia.org/wiki/Jamaican_passport |
| JP | Japan | en.wikipedia.org/wiki/Japanese_passport |
| JE | Jersey | en.wikipedia.org/wiki/Jersey-variant_Bri |
| JO | Jordan | en.wikipedia.org/wiki/Jordanian_passport |
| KZ | Kazakhstan | en.wikipedia.org/wiki/Kazakhstani_passpo |
| KE | Kenya | en.wikipedia.org/wiki/Kenyan_passport |
| KI | Kiribati | commons.wikimedia.org/wiki/Category:Pass |
| XK | Kosovo | en.wikipedia.org/wiki/Kosovo_passport |
| KW | Kuwait | commons.wikimedia.org/wiki/Category:Pass |
| KG | Kyrgyzstan | en.wikipedia.org/wiki/Kyrgyzstani_passpo |
| LA | Laos | en.wikipedia.org/wiki/Laotian_passport |
| LV | Latvia | en.wikipedia.org/wiki/Latvian_passport |
| LB | Lebanon | en.wikipedia.org/wiki/Lebanese_passport |
| LS | Lesotho | commons.wikimedia.org/wiki/Special:Searc |
| LR | Liberia | en.wikipedia.org/wiki/Liberian_passport |
| LY | Libya | en.wikipedia.org/wiki/Libyan_passport |
| LI | Liechtenstein | en.wikipedia.org/wiki/Liechtenstein_pass |
| LT | Lithuania | en.wikipedia.org/wiki/Lithuanian_passpor |
| LU | Luxembourg | en.wikipedia.org/wiki/Luxembourgish_pass |
| MO | Macao | en.wikipedia.org/wiki/Macao_Special_Admi |
| MW | Malawi | commons.wikimedia.org/wiki/Special:Searc |
| MY | Malaysia | en.wikipedia.org/wiki/Malaysian_passport |
| MV | Maldives | en.wikipedia.org/wiki/Maldivian_passport |
| ML | Mali | commons.wikimedia.org/wiki/Special:Searc |
| MT | Malta | en.wikipedia.org/wiki/Maltese_passport |
| MH | Marshall Islands | en.wikipedia.org/wiki/Marshallese_passpo |
| MQ | Martinique | commons.wikimedia.org/wiki/Special:Searc |
| MR | Mauritania | en.wikipedia.org/wiki/Mauritanian_passpo |
| MU | Mauritius | commons.wikimedia.org/wiki/Category:Pass |
| YT | Mayotte | commons.wikimedia.org/wiki/Special:Searc |
| MX | Mexico | en.wikipedia.org/wiki/Mexican_passport |
| FM | Micronesia | en.wikipedia.org/wiki/Micronesian_passpo |
| MD | Moldova | en.wikipedia.org/wiki/Moldovan_passport |
| MC | Monaco | en.wikipedia.org/wiki/Mon%C3%A9gasque_pa |
| MN | Mongolia | en.wikipedia.org/wiki/Mongolian_passport |
| ME | Montenegro | en.wikipedia.org/wiki/Montenegrin_passpo |
| MS | Montserrat | en.wikipedia.org/wiki/British_passport_( |
| MA | Morocco | en.wikipedia.org/wiki/Moroccan_passport |
| MZ | Mozambique | en.wikipedia.org/wiki/Mozambican_passpor |
| MM | Myanmar | en.wikipedia.org/wiki/Myanmar_passport |
| NA | Namibia | en.wikipedia.org/wiki/Namibian_passport |
| NR | Nauru | commons.wikimedia.org/wiki/Special:Searc |
| NP | Nepal | en.wikipedia.org/wiki/Nepalese_passport |
| NL | Netherlands | en.wikipedia.org/wiki/Dutch_passport |
| NC | New Caledonia | commons.wikimedia.org/wiki/Special:Searc |
| NZ | New Zealand | commons.wikimedia.org/wiki/Category:Pass |
| NI | Nicaragua | commons.wikimedia.org/wiki/Category:Pass |
| NE | Niger | en.wikipedia.org/wiki/Nigerien_passport |
| NG | Nigeria | en.wikipedia.org/wiki/Nigerian_passport |
| NU | Niue | commons.wikimedia.org/wiki/Special:Searc |
| NF | Norfolk Island | en.wikipedia.org/wiki/Australian_passpor |
| KP | North Korea | en.wikipedia.org/wiki/North_Korean_passp |
| MK | North Macedonia | en.wikipedia.org/wiki/North_Macedonian_p |
| NO | Norway | en.wikipedia.org/wiki/Norwegian_passport |
| OM | Oman | commons.wikimedia.org/wiki/Category:Pass |
| PK | Pakistan | en.wikipedia.org/wiki/Pakistani_passport |
| PW | Palau | commons.wikimedia.org/wiki/Special:Searc |
| PS | Palestine | en.wikipedia.org/wiki/Palestinian_passpo |
| PA | Panama | en.wikipedia.org/wiki/Panamanian_passpor |
| PG | Papua New Guinea | commons.wikimedia.org/wiki/Category:Pass |
| PY | Paraguay | en.wikipedia.org/wiki/Paraguayan_passpor |
| PE | Peru | en.wikipedia.org/wiki/Peruvian_passport |
| PH | Philippines | en.wikipedia.org/wiki/Philippine_passpor |
| PL | Poland | en.wikipedia.org/wiki/Polish_passport |
| PT | Portugal | en.wikipedia.org/wiki/Portuguese_passpor |
| QA | Qatar | en.wikipedia.org/wiki/Qatari_passport |
| RE | Réunion | commons.wikimedia.org/wiki/Special:Searc |
| RO | Romania | en.wikipedia.org/wiki/Romanian_passport |
| RU | Russia | en.wikipedia.org/wiki/Russian_passport |
| RW | Rwanda | en.wikipedia.org/wiki/Rwandan_passport |
| BL | Saint Barthélemy | commons.wikimedia.org/wiki/Special:Searc |
| SH | Saint Helena, Ascension and Tristan da Cunha | commons.wikimedia.org/wiki/Category:Pass |
| KN | Saint Kitts and Nevis | commons.wikimedia.org/wiki/Category:Pass |
| LC | Saint Lucia | en.wikipedia.org/wiki/Saint_Lucian_passp |
| MF | Saint Martin (French) | en.wikipedia.org/wiki/French_passport |
| PM | Saint Pierre and Miquelon | commons.wikimedia.org/wiki/Special:Searc |
| VC | Saint Vincent and the Grenadines | commons.wikimedia.org/wiki/Category:Pass |
| WS | Samoa | commons.wikimedia.org/wiki/Special:Searc |
| SM | San Marino | commons.wikimedia.org/wiki/Special:Searc |
| ST | Sao Tome and Principe | commons.wikimedia.org/wiki/Special:Searc |
| SA | Saudi Arabia | en.wikipedia.org/wiki/Saudi_passport |
| SN | Senegal | commons.wikimedia.org/wiki/Category:Pass |
| SC | Seychelles | en.wikipedia.org/wiki/Seychellois_passpo |
| SL | Sierra Leone | en.wikipedia.org/wiki/Sierra_Leonean_pas |
| SG | Singapore | en.wikipedia.org/wiki/Singapore_passport |
| SK | Slovakia | en.wikipedia.org/wiki/Slovak_passport |
| SB | Solomon Islands | commons.wikimedia.org/wiki/Special:Searc |
| SO | Somalia | en.wikipedia.org/wiki/Somali_passport |
| ZA | South Africa | commons.wikimedia.org/wiki/Category:Pass |
| KR | South Korea | commons.wikimedia.org/wiki/Category:Pass |
| SS | South Sudan | commons.wikimedia.org/wiki/Category:Pass |
| ES | Spain | en.wikipedia.org/wiki/Spanish_passport |
| LK | Sri Lanka | en.wikipedia.org/wiki/Sri_Lankan_passpor |
| SD | Sudan | commons.wikimedia.org/wiki/Category:Pass |
| SR | Suriname | commons.wikimedia.org/wiki/Special:Searc |
| SJ | Svalbard and Jan Mayen | en.wikipedia.org/wiki/Norwegian_passport |
| SE | Sweden | en.wikipedia.org/wiki/Swedish_passport |
| CH | Switzerland | commons.wikimedia.org/wiki/Category:Pass |
| SY | Syria | en.wikipedia.org/wiki/Syrian_passport |
| TW | Taiwan | en.wikipedia.org/wiki/Taiwan_passport |
| TJ | Tajikistan | en.wikipedia.org/wiki/Tajik_passport |
| TZ | Tanzania | en.wikipedia.org/wiki/Tanzanian_passport |
| TH | Thailand | en.wikipedia.org/wiki/Thai_passport |
| TL | Timor-Leste | en.wikipedia.org/wiki/Timor-Leste_passpo |
| TG | Togo | en.wikipedia.org/wiki/Togolese_passport |
| TK | Tokelau | commons.wikimedia.org/wiki/Category:Pass |
| TO | Tonga | commons.wikimedia.org/wiki/Special:Searc |
| TT | Trinidad and Tobago | commons.wikimedia.org/wiki/Category:Pass |
| TN | Tunisia | en.wikipedia.org/wiki/Tunisian_passport |
| TR | Türkiye | en.wikipedia.org/wiki/Turkish_passport |
| TM | Turkmenistan | en.wikipedia.org/wiki/Turkmen_passport |
| TC | Turks and Caicos Islands | commons.wikimedia.org/wiki/Category:Pass |
| TV | Tuvalu | en.wikipedia.org/wiki/Tuvaluan_passport |
| VI | U.S. Virgin Islands | commons.wikimedia.org/wiki/Special:Searc |
| UG | Uganda | en.wikipedia.org/wiki/Ugandan_passport |
| UA | Ukraine | en.wikipedia.org/wiki/Ukrainian_passport |
| AE | United Arab Emirates | en.wikipedia.org/wiki/Emirati_passport |
| GB | United Kingdom | commons.wikimedia.org/wiki/File:UK%20New |
| US | United States | en.wikipedia.org/wiki/United_States_pass |
| UY | Uruguay | commons.wikimedia.org/wiki/Category:Pass |
| UZ | Uzbekistan | en.wikipedia.org/wiki/Uzbekistan_passpor |
| VU | Vanuatu | commons.wikimedia.org/wiki/Category:Pass |
| VA | Vatican City | en.wikipedia.org/wiki/Vatican_City_and_H |
| VE | Venezuela | en.wikipedia.org/wiki/Venezuelan_passpor |
| VN | Vietnam | en.wikipedia.org/wiki/Vietnamese_passpor |
| WF | Wallis and Futuna | en.wikipedia.org/wiki/French_passport |
| EH | Western Sahara | en.wikipedia.org/wiki/Sahrawi_passport |
| YE | Yemen | en.wikipedia.org/wiki/Yemeni_passport |
| ZM | Zambia | commons.wikimedia.org/wiki/Special:Searc |
| ZW | Zimbabwe | commons.wikimedia.org/wiki/Category:Pass |