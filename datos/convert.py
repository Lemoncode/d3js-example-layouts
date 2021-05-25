import csv
import json


provincias = {
"AB": "Albacete",
"VI": "Álava",
"A": "Alicante",
"AL": "Almería",
"AV": "Ávila",
"BA": "Badajoz",
"PM": "Baleares",
"B": "Barcelona",
"BU": "Burgos",
"CC": "Cáceres",
"CA": "Cádiz",
"CS": "Castellón",
"CR": "Ciudad Real",
"CO": "Córdoba",
"C": "La Coruña",
"CU": "Cuenca",
"GI": "Girona",
"GR": "Granada",
"GU": "Guadalajara",
"SS": "Guipúzcoa",
"H": "Huelva",
"HU": "Huesca",
"J": "Jaén",
"LE": "León",
"L": "Lleida",
"LO": "La Rioja",
"LU": "Lugo",
"M": "Madrid",
"MA": "Málaga",
"MU": "Murcia",
"NA": "Navarra",
"OR": "Orense",
"O": "Asturias",
"P": "Palencia",
"GC": "Las Palmas",
"PO": "Pontevedra",
"SA": "Salamanca",
"TF": "Santa Cruz de Tenerife",
"S": "Cantabria",
"SG": "Segovia",
"SE": "Sevilla",
"SO": "Soria",
"T": "Tarragona",
"TE": "Teruel",
"TO": "Toledo",
"V": "Valencia",
"VA": "Valladolid",
"BI": "Vizcaya",
"ZA": "Zamora",
"Z": "Zaragoza",
"CE": "Ceuta",
"ML": "Melilla"	
}

ccaa = {
"AB": "Castilla-La Mancha",
"VI": "Euskadi",
"A": "Comunitat  Valenciana",
"AL": "Andalucía",
"AV": "Castilla y León",
"BA": "Extremadura",
"PM": "Baleares",
"B": "Catalunya",
"BU": "Castilla y León",
"CC": "Extremadura",
"CA": "Andalucía",
"CS": "Comunitat  Valenciana",
"CR": "Castilla-La Mancha",
"CO": "Andalucía",
"C": "Galicia",
"CU": "Castilla-La Mancha",
"GI": "Catalunya",
"GR": "Andalucía",
"GU": "Castilla-La Mancha",
"SS": "Euskadi",
"H": "Andalucía",
"HU": "Aragón",
"J": "Andalucía",
"LE": "Castilla y León",
"L": "Catalunya",
"LO": "La Rioja",
"LU": "Galicia",
"M": "Madrid",
"MA": "Andalucía",
"MU": "Murcia",
"NA": "Navarra",
"OR": "Galicia",
"O": "Asturias",
"P": "Castilla y León",
"GC": "Canarias",
"PO": "Galicia",
"SA": "Castilla y León",
"TF": "Canarias",
"S": "Cantabria",
"SG": "Castilla y León",
"SE": "Andalucía",
"SO": "Castilla y León",
"T": "Catalunya",
"TE": "Aragón",
"TO": "Castilla-La Mancha", 
"V": "Comunitat  Valenciana",
"VA": "Castilla y León",
"BI": "Euskadi",
"ZA": "Castilla y León",
"Z": "Aragón",
"CE": "Ceuta",
"ML": "Melilla"	
}





total_cases = {}
with open('casos_tecnica_provincia.csv') as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')
    line_count = 0
    for row in csv_reader:
        if line_count > 0:
            province = row[0]
            cases = row[2]
            if province in total_cases:
                total_cases[province] += int(cases)
            else:
                total_cases[province] = int(cases)
        line_count += 1


out = []
for code_provincia in total_cases.keys():
    if code_provincia != "NC":
        out.append({"name": provincias[code_provincia], "cases": total_cases[code_provincia], "code": code_provincia, "ccaa": ccaa[code_provincia]})

with open('casos_provincia.json', 'w') as f:
    f.write(json.dumps(out, indent=4))
