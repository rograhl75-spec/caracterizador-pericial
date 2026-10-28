/* NR-15, Anexo 11, Quadro 1 — n: nome, ppm, mg (mg/m³), g: grau, teto, pele, vide: remissões do quadro, al: outros nomes */
const A11 = [
{
"n": "Acetaldeído",
"ppm": 78.0,
"mg": 140.0,
"g": "máximo",
"teto": false,
"pele": false,
"vide": [
"Aldeído acético",
"Etanal"
],
"al": [
"CH3CHO"
]
},
{
"n": "Acetato de cellosolve",
"ppm": 78.0,
"mg": 420.0,
"g": "médio",
"teto": false,
"pele": true,
"vide": [
"Acetato de éter monoetílico de etileno glicol",
"Acetato de 2-etóxi etila"
],
"al": [
"Acetato de 2-etoxietila"
]
},
{
"n": "Acetato de etila",
"ppm": 310.0,
"mg": 1090.0,
"g": "mínimo",
"teto": false,
"pele": false,
"al": [
"Etanoato de etila"
]
},
{
"n": "Acetileno",
"ppm": null,
"mg": null,
"g": null,
"teto": false,
"pele": false,
"obs": "Asfixiante simples: O₂ mínimo de 18% em volume"
},
{
"n": "Acetona",
"ppm": 780.0,
"mg": 1870.0,
"g": "mínimo",
"teto": false,
"pele": false,
"vide": [
"Propanona"
],
"al": [
"Dimetilcetona"
]
},
{
"n": "Acetonitrila",
"ppm": 30.0,
"mg": 55.0,
"g": "máximo",
"teto": false,
"pele": false,
"vide": [
"Cianeto de metila"
]
},
{
"n": "Ácido acético",
"ppm": 8.0,
"mg": 20.0,
"g": "médio",
"teto": false,
"pele": false,
"vide": [
"Ácido etanóico"
]
},
{
"n": "Ácido cianídrico",
"ppm": 8.0,
"mg": 9.0,
"g": "máximo",
"teto": false,
"pele": true,
"vide": [
"Gás cianídrico"
],
"al": [
"HCN",
"Cianeto de hidrogênio"
]
},
{
"n": "Ácido clorídrico",
"ppm": 4.0,
"mg": 5.5,
"g": "máximo",
"teto": true,
"pele": false,
"vide": [
"Gás clorídrico"
],
"al": [
"HCl",
"Cloreto de hidrogênio",
"Ácido muriático"
]
},
{
"n": "Ácido crômico (névoa)",
"ppm": null,
"mg": 0.04,
"g": "máximo",
"teto": false,
"pele": false,
"al": [
"Cromo hexavalente (névoa)"
]
},
{
"n": "Ácido fluorídrico",
"ppm": 2.5,
"mg": 1.5,
"g": "máximo",
"teto": false,
"pele": false,
"al": [
"HF",
"Fluoreto de hidrogênio"
]
},
{
"n": "Ácido fórmico",
"ppm": 4.0,
"mg": 7.0,
"g": "médio",
"teto": false,
"pele": false,
"vide": [
"Ácido metanóico"
]
},
{
"n": "Acrilato de metila",
"ppm": 8.0,
"mg": 27.0,
"g": "máximo",
"teto": false,
"pele": true
},
{
"n": "Acrilonitrila",
"ppm": 16.0,
"mg": 35.0,
"g": "máximo",
"teto": false,
"pele": true,
"vide": [
"Cianeto de vinila"
]
},
{
"n": "Álcool isoamílico",
"ppm": 78.0,
"mg": 280.0,
"g": "mínimo",
"teto": false,
"pele": false
},
{
"n": "Álcool n-butílico",
"ppm": 40.0,
"mg": 115.0,
"g": "máximo",
"teto": true,
"pele": true,
"vide": [
"n-Butanol"
],
"al": [
"1-Butanol"
]
},
{
"n": "Álcool isobutílico",
"ppm": 40.0,
"mg": 115.0,
"g": "médio",
"teto": false,
"pele": false,
"vide": [
"Isobutanol"
]
},
{
"n": "Álcool sec-butílico (2-butanol)",
"ppm": 115.0,
"mg": 350.0,
"g": "médio",
"teto": false,
"pele": false,
"vide": [
"sec-Butanol"
]
},
{
"n": "Álcool terc-butílico",
"ppm": 78.0,
"mg": 235.0,
"g": "médio",
"teto": false,
"pele": false
},
{
"n": "Álcool etílico",
"ppm": 780.0,
"mg": 1480.0,
"g": "mínimo",
"teto": false,
"pele": false,
"vide": [
"Etanol"
]
},
{
"n": "Álcool furfurílico",
"ppm": 4.0,
"mg": 15.5,
"g": "médio",
"teto": false,
"pele": true
},
{
"n": "Álcool metílico",
"ppm": 156.0,
"mg": 200.0,
"g": "máximo",
"teto": false,
"pele": true,
"vide": [
"Metanol"
]
},
{
"n": "Álcool n-propílico",
"ppm": 156.0,
"mg": 390.0,
"g": "médio",
"teto": false,
"pele": true,
"vide": [
"n-Propanol"
]
},
{
"n": "Álcool isopropílico",
"ppm": 310.0,
"mg": 765.0,
"g": "médio",
"teto": false,
"pele": true,
"vide": [
"iso-Propanol"
],
"al": [
"Isopropanol",
"IPA",
"2-Propanol"
]
},
{
"n": "Amônia",
"ppm": 20.0,
"mg": 14.0,
"g": "médio",
"teto": false,
"pele": false,
"vide": [
"Gás amoníaco"
],
"al": [
"NH3",
"Amoníaco"
]
},
{
"n": "Anilina",
"ppm": 4.0,
"mg": 15.0,
"g": "máximo",
"teto": false,
"pele": true,
"al": [
"Aminobenzeno",
"Fenilamina"
]
},
{
"n": "Argônio",
"ppm": null,
"mg": null,
"g": null,
"teto": false,
"pele": false,
"obs": "Asfixiante simples: O₂ mínimo de 18% em volume"
},
{
"n": "Arsina (arsenamina)",
"ppm": 0.04,
"mg": 0.16,
"g": "máximo",
"teto": false,
"pele": false
},
{
"n": "Benzeno",
"obs": "Excluído do Anexo 11 pela Portaria SSST 3/1994: ver Anexo 13-A (VRT)",
"ppm": null,
"mg": null,
"g": null,
"teto": false,
"pele": false
},
{
"n": "Brometo de etila",
"ppm": 156.0,
"mg": 695.0,
"g": "máximo",
"teto": false,
"pele": false,
"vide": [
"Bromoetano"
]
},
{
"n": "Brometo de metila",
"ppm": 12.0,
"mg": 47.0,
"g": "máximo",
"teto": false,
"pele": true,
"vide": [
"Bromometano"
]
},
{
"n": "Bromo",
"ppm": 0.08,
"mg": 0.6,
"g": "máximo",
"teto": false,
"pele": false
},
{
"n": "Bromofórmio",
"ppm": 0.4,
"mg": 4.0,
"g": "médio",
"teto": false,
"pele": true,
"vide": [
"Tribromometano"
]
},
{
"n": "1,3 Butadieno",
"ppm": 780.0,
"mg": 1720.0,
"g": "médio",
"teto": false,
"pele": false
},
{
"n": "n-Butano",
"ppm": 470.0,
"mg": 1090.0,
"g": "médio",
"teto": false,
"pele": false
},
{
"n": "n-Butilamina",
"ppm": 4.0,
"mg": 12.0,
"g": "máximo",
"teto": true,
"pele": true
},
{
"n": "Butil cellosolve",
"ppm": 39.0,
"mg": 190.0,
"g": "médio",
"teto": false,
"pele": true,
"vide": [
"2-Butóxi etanol",
"Éter monobutílico do etileno glicol"
],
"al": [
"Butilglicol"
]
},
{
"n": "n-Butil mercaptana",
"ppm": 0.4,
"mg": 1.2,
"g": "médio",
"teto": false,
"pele": false,
"vide": [
"1-Butanotiol"
]
},
{
"n": "Chumbo",
"ppm": null,
"mg": 0.1,
"g": "máximo",
"teto": false,
"pele": false,
"al": [
"Pb",
"Fumos de chumbo"
]
},
{
"n": "Cianogênio",
"ppm": 8.0,
"mg": 16.0,
"g": "máximo",
"teto": false,
"pele": false
},
{
"n": "Ciclohexano",
"ppm": 235.0,
"mg": 820.0,
"g": "médio",
"teto": false,
"pele": false
},
{
"n": "Ciclohexanol",
"ppm": 40.0,
"mg": 160.0,
"g": "máximo",
"teto": false,
"pele": false
},
{
"n": "Ciclohexilamina",
"ppm": 8.0,
"mg": 32.0,
"g": "máximo",
"teto": false,
"pele": true
},
{
"n": "Cloreto de etila",
"ppm": 780.0,
"mg": 2030.0,
"g": "médio",
"teto": false,
"pele": false,
"vide": [
"Cloroetano"
]
},
{
"n": "Cloreto de metila",
"ppm": 78.0,
"mg": 165.0,
"g": "máximo",
"teto": false,
"pele": false
},
{
"n": "Cloreto de metileno",
"ppm": 156.0,
"mg": 560.0,
"g": "máximo",
"teto": false,
"pele": false,
"vide": [
"Diclorometano"
],
"al": [
"DCM"
]
},
{
"n": "Cloreto de vinila",
"ppm": 156.0,
"mg": 398.0,
"g": "máximo",
"teto": true,
"pele": false,
"vide": [
"Cloroetílico"
],
"al": [
"MVC",
"Monocloreto de vinila"
]
},
{
"n": "Cloreto de vinilideno",
"ppm": 8.0,
"mg": 31.0,
"g": "máximo",
"teto": false,
"pele": false,
"vide": [
"1,1 Dicloroetileno"
]
},
{
"n": "Cloro",
"ppm": 0.8,
"mg": 2.3,
"g": "máximo",
"teto": false,
"pele": false
},
{
"n": "Clorobenzeno",
"ppm": 59.0,
"mg": 275.0,
"g": "médio",
"teto": false,
"pele": false,
"vide": [
"Cloreto de fenila"
]
},
{
"n": "Clorobromometano",
"ppm": 156.0,
"mg": 820.0,
"g": "máximo",
"teto": false,
"pele": false
},
{
"n": "Clorodifluometano (freon 22)",
"ppm": 780.0,
"mg": 2730.0,
"g": "mínimo",
"teto": false,
"pele": false,
"vide": [
"Freon 22"
],
"al": [
"R-22",
"HCFC-22"
]
},
{
"n": "Clorofórmio",
"ppm": 20.0,
"mg": 94.0,
"g": "máximo",
"teto": false,
"pele": false,
"vide": [
"Triclorometano"
]
},
{
"n": "1-Cloro 1-nitropropano",
"ppm": 16.0,
"mg": 78.0,
"g": "máximo",
"teto": false,
"pele": false
},
{
"n": "Cloroprene",
"ppm": 20.0,
"mg": 70.0,
"g": "máximo",
"teto": false,
"pele": true
},
{
"n": "Cumeno",
"ppm": 39.0,
"mg": 190.0,
"g": "máximo",
"teto": false,
"pele": true,
"vide": [
"Isopropil benzeno"
]
},
{
"n": "Decaborano",
"ppm": 0.04,
"mg": 0.25,
"g": "máximo",
"teto": false,
"pele": true
},
{
"n": "Demeton",
"ppm": 0.008,
"mg": 0.08,
"g": "máximo",
"teto": false,
"pele": true,
"vide": [
"Systox"
]
},
{
"n": "Diborano",
"ppm": 0.08,
"mg": 0.08,
"g": "máximo",
"teto": false,
"pele": false
},
{
"n": "1,2-Dibramoetano",
"ppm": 16.0,
"mg": 110.0,
"g": "médio",
"teto": false,
"pele": true
},
{
"n": "o-Diclorobenzeno",
"ppm": 39.0,
"mg": 235.0,
"g": "máximo",
"teto": false,
"pele": false
},
{
"n": "Diclorodifluormetano (freon 12)",
"ppm": 780.0,
"mg": 3860.0,
"g": "mínimo",
"teto": true,
"pele": false,
"vide": [
"Freon 12"
],
"al": [
"R-12",
"CFC-12"
]
},
{
"n": "1,1 Dicloroetano",
"ppm": 156.0,
"mg": 640.0,
"g": "médio",
"teto": false,
"pele": false
},
{
"n": "1,2 Dicloroetano",
"ppm": 39.0,
"mg": 156.0,
"g": "máximo",
"teto": false,
"pele": false,
"al": [
"Dicloreto de etileno"
]
},
{
"n": "1,2 Dicloroetileno",
"ppm": 155.0,
"mg": 615.0,
"g": "médio",
"teto": false,
"pele": false
},
{
"n": "1,1 Dicloro-1-nitroetano",
"ppm": 8.0,
"mg": 47.0,
"g": "máximo",
"teto": true,
"pele": false
},
{
"n": "1,2 Dicloropropano",
"ppm": 59.0,
"mg": 275.0,
"g": "máximo",
"teto": false,
"pele": false
},
{
"n": "Diclorotetrafluoretano (freon 114)",
"ppm": 780.0,
"mg": 5460.0,
"g": "mínimo",
"teto": false,
"pele": false,
"vide": [
"Freon 114"
]
},
{
"n": "Dietil amina",
"ppm": 20.0,
"mg": 59.0,
"g": "médio",
"teto": false,
"pele": false
},
{
"n": "2,4 Diisocianato de tolueno (TDI)",
"ppm": 0.016,
"mg": 0.11,
"g": "máximo",
"teto": true,
"pele": false,
"vide": [
"Tolueno-2,4-diisocianato (TDI)"
],
"al": [
"TDI"
]
},
{
"n": "Diisopropilamina",
"ppm": 4.0,
"mg": 16.0,
"g": "máximo",
"teto": false,
"pele": true
},
{
"n": "Dimetilacetamida",
"ppm": 8.0,
"mg": 28.0,
"g": "máximo",
"teto": false,
"pele": true
},
{
"n": "Dimetilamina",
"ppm": 8.0,
"mg": 14.0,
"g": "médio",
"teto": false,
"pele": false
},
{
"n": "Dimetiformamida",
"ppm": 8.0,
"mg": 24.0,
"g": "médio",
"teto": false,
"pele": false,
"al": [
"DMF",
"Dimetilformamida"
]
},
{
"n": "1,1 Dimetil hidrazina",
"ppm": 0.4,
"mg": 0.8,
"g": "máximo",
"teto": false,
"pele": true
},
{
"n": "Dióxido de carbono",
"ppm": 3900.0,
"mg": 7020.0,
"g": "mínimo",
"teto": false,
"pele": false,
"vide": [
"Gás carbônico"
],
"al": [
"CO2"
]
},
{
"n": "Dióxido de cloro",
"ppm": 0.08,
"mg": 0.25,
"g": "máximo",
"teto": false,
"pele": false
},
{
"n": "Dióxido de enxofre",
"ppm": 4.0,
"mg": 10.0,
"g": "máximo",
"teto": false,
"pele": false,
"vide": [
"Anidrido sulfuroso"
],
"al": [
"SO2"
]
},
{
"n": "Dióxido de nitrogênio",
"ppm": 4.0,
"mg": 7.0,
"g": "máximo",
"teto": true,
"pele": false,
"al": [
"NO2"
]
},
{
"n": "Dissulfeto de carbono",
"ppm": 16.0,
"mg": 47.0,
"g": "máximo",
"teto": false,
"pele": true,
"al": [
"CS2",
"Sulfeto de carbono"
]
},
{
"n": "Estibina",
"ppm": 0.08,
"mg": 0.4,
"g": "máximo",
"teto": false,
"pele": false,
"vide": [
"Hidreto de antimônio"
]
},
{
"n": "Estireno",
"ppm": 78.0,
"mg": 328.0,
"g": "médio",
"teto": false,
"pele": false,
"vide": [
"Vinilbenzeno"
],
"al": [
"Estirol"
]
},
{
"n": "Etano",
"ppm": null,
"mg": null,
"g": null,
"teto": false,
"pele": false,
"obs": "Asfixiante simples: O₂ mínimo de 18% em volume"
},
{
"n": "Éter decloroetílico",
"ppm": 4.0,
"mg": 24.0,
"g": "máximo",
"teto": false,
"pele": true
},
{
"n": "Éter etílico",
"ppm": 310.0,
"mg": 940.0,
"g": "médio",
"teto": false,
"pele": false,
"vide": [
"Dietil éter"
],
"al": [
"Éter sulfúrico"
]
},
{
"n": "Etilamina",
"ppm": 8.0,
"mg": 14.0,
"g": "máximo",
"teto": false,
"pele": false
},
{
"n": "Etilbenzeno",
"ppm": 78.0,
"mg": 340.0,
"g": "médio",
"teto": false,
"pele": false
},
{
"n": "Etileno",
"ppm": null,
"mg": null,
"g": null,
"teto": false,
"pele": false,
"obs": "Asfixiante simples: O₂ mínimo de 18% em volume"
},
{
"n": "Etilenoimina",
"ppm": 0.4,
"mg": 0.8,
"g": "máximo",
"teto": false,
"pele": true,
"al": [
"Aziridina"
]
},
{
"n": "Etil mercaptana",
"ppm": 0.4,
"mg": 0.8,
"g": "médio",
"teto": false,
"pele": false,
"vide": [
"Etanotiol"
]
},
{
"n": "n-Etil morfolina",
"ppm": 16.0,
"mg": 74.0,
"g": "médio",
"teto": false,
"pele": true
},
{
"n": "2-Etoxietanol",
"ppm": 78.0,
"mg": 290.0,
"g": "médio",
"teto": false,
"pele": true,
"vide": [
"Cellosolve",
"Éter monoetílico do etileno glicol"
]
},
{
"n": "Fenol",
"ppm": 4.0,
"mg": 15.0,
"g": "máximo",
"teto": false,
"pele": true,
"al": [
"Ácido carbólico"
]
},
{
"n": "Fluortriclorometano (freon 11)",
"ppm": 780.0,
"mg": 4370.0,
"g": "médio",
"teto": false,
"pele": false,
"vide": [
"Freon 11"
],
"al": [
"R-11",
"CFC-11"
]
},
{
"n": "Formaldeído (formol)",
"ppm": 1.6,
"mg": 2.3,
"g": "máximo",
"teto": true,
"pele": false,
"vide": [
"Aldeído fórmico"
],
"al": [
"Formol",
"Metanal"
]
},
{
"n": "Fosfina (fosfamina)",
"ppm": 0.23,
"mg": 0.3,
"g": "máximo",
"teto": false,
"pele": false
},
{
"n": "Fosgênio",
"ppm": 0.08,
"mg": 0.3,
"g": "máximo",
"teto": false,
"pele": false,
"vide": [
"Cloreto de carbonila"
]
},
{
"n": "Gás sulfídrico",
"ppm": 8.0,
"mg": 12.0,
"g": "máximo",
"teto": false,
"pele": false,
"vide": [
"Sulfeto de hidrogênio"
],
"al": [
"H2S"
]
},
{
"n": "Hélio",
"ppm": null,
"mg": null,
"g": null,
"teto": false,
"pele": false,
"obs": "Asfixiante simples: O₂ mínimo de 18% em volume"
},
{
"n": "Hidrazina",
"ppm": 0.08,
"mg": 0.08,
"g": "máximo",
"teto": false,
"pele": true,
"vide": [
"Diamina"
]
},
{
"n": "Hidrogênio",
"ppm": null,
"mg": null,
"g": null,
"teto": false,
"pele": false,
"obs": "Asfixiante simples: O₂ mínimo de 18% em volume"
},
{
"n": "Isopropilamina",
"ppm": 4.0,
"mg": 9.5,
"g": "médio",
"teto": false,
"pele": false
},
{
"n": "Mercúrio (todas as formas exceto orgânicas)",
"ppm": null,
"mg": 0.04,
"g": "máximo",
"teto": false,
"pele": false,
"al": [
"Hg",
"Mercúrio metálico"
]
},
{
"n": "Metacrilato de metila",
"ppm": 78.0,
"mg": 320.0,
"g": "mínimo",
"teto": false,
"pele": false
},
{
"n": "Metano",
"ppm": null,
"mg": null,
"g": null,
"teto": false,
"pele": false,
"obs": "Asfixiante simples: O₂ mínimo de 18% em volume"
},
{
"n": "Metilamina",
"ppm": 8.0,
"mg": 9.5,
"g": "máximo",
"teto": false,
"pele": false
},
{
"n": "Metil cellosolve",
"ppm": 20.0,
"mg": 60.0,
"g": "máximo",
"teto": false,
"pele": true,
"vide": [
"2-Metoxi etanol",
"Éter monometílico do etileno glicol"
]
},
{
"n": "Metil ciclohexanol",
"ppm": 39.0,
"mg": 180.0,
"g": "médio",
"teto": false,
"pele": false
},
{
"n": "Metilclorofórmio",
"ppm": 275.0,
"mg": 1480.0,
"g": "médio",
"teto": false,
"pele": false,
"vide": [
"1,1,1 Tricloroetano"
]
},
{
"n": "Metil demeton",
"ppm": null,
"mg": 0.4,
"g": "máximo",
"teto": false,
"pele": true
},
{
"n": "Metil etil cetona",
"ppm": 155.0,
"mg": 460.0,
"g": "médio",
"teto": false,
"pele": false,
"vide": [
"Butanona"
],
"al": [
"MEK",
"Metiletilcetona",
"2-Butanona"
]
},
{
"n": "Metil isobutilcarbinol",
"ppm": 20.0,
"mg": 78.0,
"g": "máximo",
"teto": false,
"pele": true,
"vide": [
"Álcool metil amílico"
]
},
{
"n": "Metil mercaptana (metanotiol)",
"ppm": 0.4,
"mg": 0.8,
"g": "médio",
"teto": false,
"pele": false
},
{
"n": "Monometil hidrazina",
"ppm": 0.16,
"mg": 0.27,
"g": "máximo",
"teto": true,
"pele": true,
"al": [
"MMH"
]
},
{
"n": "Monóxido de carbono",
"ppm": 39.0,
"mg": 43.0,
"g": "máximo",
"teto": false,
"pele": false,
"al": [
"CO"
]
},
{
"n": "Negro de fumo",
"ppm": null,
"mg": 3.5,
"g": "máximo",
"teto": false,
"pele": false,
"al": [
"Carbon black",
"Fuligem industrial"
]
},
{
"n": "Neônio",
"ppm": null,
"mg": null,
"g": null,
"teto": false,
"pele": false,
"obs": "Asfixiante simples: O₂ mínimo de 18% em volume"
},
{
"n": "Níquel carbonila (níquel tetracarbonila)",
"ppm": 0.04,
"mg": 0.28,
"g": "máximo",
"teto": false,
"pele": false
},
{
"n": "Nitrato de n-propila",
"ppm": 20.0,
"mg": 85.0,
"g": "máximo",
"teto": false,
"pele": false
},
{
"n": "Nitroetano",
"ppm": 78.0,
"mg": 245.0,
"g": "médio",
"teto": false,
"pele": false
},
{
"n": "Nitrometano",
"ppm": 78.0,
"mg": 195.0,
"g": "máximo",
"teto": false,
"pele": false
},
{
"n": "1 - Nitropropano",
"ppm": 20.0,
"mg": 70.0,
"g": "médio",
"teto": false,
"pele": false
},
{
"n": "2 - Nitropropano",
"ppm": 20.0,
"mg": 70.0,
"g": "médio",
"teto": false,
"pele": false
},
{
"n": "Óxido de etileno",
"ppm": 39.0,
"mg": 70.0,
"g": "máximo",
"teto": false,
"pele": false,
"al": [
"Oxirano",
"EtO"
]
},
{
"n": "Óxido nítrico (NO)",
"ppm": 20.0,
"mg": 23.0,
"g": "máximo",
"teto": false,
"pele": false,
"al": [
"NO",
"Monóxido de nitrogênio"
]
},
{
"n": "Óxido nitroso (N₂O)",
"ppm": null,
"mg": null,
"g": null,
"teto": false,
"pele": false,
"obs": "Asfixiante simples: O₂ mínimo de 18% em volume"
},
{
"n": "Ozona",
"ppm": 0.08,
"mg": 0.16,
"g": "máximo",
"teto": false,
"pele": false,
"al": [
"Ozônio",
"O3"
]
},
{
"n": "Pentaborano",
"ppm": 0.004,
"mg": 0.008,
"g": "máximo",
"teto": false,
"pele": false
},
{
"n": "n-Pentano",
"ppm": 470.0,
"mg": 1400.0,
"g": "mínimo",
"teto": false,
"pele": false
},
{
"n": "Percloroetíleno",
"ppm": 78.0,
"mg": 525.0,
"g": "médio",
"teto": false,
"pele": true,
"vide": [
"Tetracloroetileno"
],
"al": [
"PERC",
"Percloro"
]
},
{
"n": "Piridina",
"ppm": 4.0,
"mg": 12.0,
"g": "médio",
"teto": false,
"pele": false
},
{
"n": "n-propano",
"ppm": null,
"mg": null,
"g": null,
"teto": false,
"pele": false,
"obs": "Asfixiante simples: O₂ mínimo de 18% em volume"
},
{
"n": "Propileno",
"ppm": null,
"mg": null,
"g": null,
"teto": false,
"pele": false,
"obs": "Asfixiante simples: O₂ mínimo de 18% em volume"
},
{
"n": "Propileno imina",
"ppm": 1.6,
"mg": 4.0,
"g": "máximo",
"teto": false,
"pele": true
},
{
"n": "Sulfato de dimetila",
"ppm": 0.08,
"mg": 0.4,
"g": "máximo",
"teto": true,
"pele": true
},
{
"n": "1,1,2,2,Tetrabromoetano",
"ppm": 0.8,
"mg": 11.0,
"g": "médio",
"teto": false,
"pele": false
},
{
"n": "Tetracloreto de carbono",
"ppm": 8.0,
"mg": 50.0,
"g": "máximo",
"teto": false,
"pele": true,
"al": [
"CCl4"
]
},
{
"n": "Tetracloroetano",
"ppm": 4.0,
"mg": 27.0,
"g": "máximo",
"teto": false,
"pele": true
},
{
"n": "Tetrahidrofurano",
"ppm": 156.0,
"mg": 460.0,
"g": "máximo",
"teto": false,
"pele": false,
"al": [
"THF"
]
},
{
"n": "Tolueno (toluol)",
"ppm": 78.0,
"mg": 290.0,
"g": "médio",
"teto": false,
"pele": true,
"al": [
"Toluol",
"Metilbenzeno"
]
},
{
"n": "1,1,2 Tricloroetano",
"ppm": 8.0,
"mg": 35.0,
"g": "médio",
"teto": false,
"pele": true,
"vide": [
"Tricloreto de vinila"
]
},
{
"n": "Tricloroetileno",
"ppm": 78.0,
"mg": 420.0,
"g": "máximo",
"teto": false,
"pele": false,
"al": [
"TCE",
"Tricloro"
]
},
{
"n": "1,2,3 Tricloropropano",
"ppm": 40.0,
"mg": 235.0,
"g": "máximo",
"teto": false,
"pele": false
},
{
"n": "1,1,2 Tricloro-1,2,2 trifluoretano (freon 113)",
"ppm": 780.0,
"mg": 5930.0,
"g": "médio",
"teto": false,
"pele": false,
"vide": [
"Freon 113"
]
},
{
"n": "Trietilamina",
"ppm": 20.0,
"mg": 78.0,
"g": "máximo",
"teto": false,
"pele": false
},
{
"n": "Trifluormonobramometano",
"ppm": 780.0,
"mg": 4760.0,
"g": "médio",
"teto": false,
"pele": false
},
{
"n": "Xileno (xilol)",
"ppm": 78.0,
"mg": 340.0,
"g": "médio",
"teto": false,
"pele": true,
"al": [
"Xilol",
"Dimetilbenzeno"
]
}
];
