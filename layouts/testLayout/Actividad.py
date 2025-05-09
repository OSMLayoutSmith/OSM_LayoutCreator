from logic import *

minerva = Symbol("Minerva")
pomona = Symbol("Pomona")
gilderoy = Symbol("Gilderoy")
horace = Symbol("Horace")

persons = [minerva, pomona, gilderoy, horace]

gryffindor = Symbol("Gryffindor")
hufflepuff = Symbol("Hufflepuff")
ravenclaw = Symbol("Ravenclaw")
slytherin = Symbol("Slytherin")

people = ["Minerva", "Pomona", "Gilderoy", "Horace"]
places = ["Hufflepuff", "Slytherin", "Gryffindor", "Ravenclaw"]

symbols = []

for person in people:
    for place in places:
        symbols.append(f"{person} {place}")

Knowledge = And()

for person in people:
    for place in places:
        for person2 in people:
            symbol = Symbol(f"{person2} {place}")
            if person != person2:
                Knowledge.add(Implication(Symbol(f"{person} {place}"), Not(symbol)))

for place in places:
    for person in people:
        for place2 in places:
            symbol = Symbol(f"{person} {place2}")
            if place != place2:
                Knowledge.add(Implication(Symbol(f"{person} {place}"), Not(symbol)))

Knowledge.add(Or(Symbol("Gilderoy Gryffindor"), Symbol("Gilderoy Ravenclaw")))
Knowledge.add(Not(Symbol("Pomona Slytherin")))
Knowledge.add(Symbol("Minerva_Gryffindor"))

def check_Knowledge(knowledge):
    for symbol in symbols:
        symbol2 = Symbol(symbol)
        if model_check(Knowledge, symbol2):
            print(f"{symbol2}: YES")
        elif not model_check(Knowledge, Not(symbol2)):
            print(f"{symbol2}: MAYBE")

check_Knowledge(Knowledge)

