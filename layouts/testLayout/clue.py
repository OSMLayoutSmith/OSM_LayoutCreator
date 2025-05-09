from logic import * 

if __name__ == "__main__":
    mustard = Symbol("Mustard")
    kitchen = Symbol("Kitchen")
    revolver = Symbol("Revolver")

    #Cartas
    not_mustard = Not(mustard)
    not_kitchen = Not(kitchen)
    not_revolver = Not(revolver)

    scarlet = Symbol("Scarlet")
    library = Symbol("Library")
    wrench = Symbol("Wrench")
    not_scarlet = Not(scarlet)
    not_library = Not(library)
    not_wrench = Not(wrench)

    #Afirmación jugador
    player2 = Or(not_scarlet, not_library, not_wrench)

    plum = Symbol("Plum")
    knife = Symbol("Knife")
    ballrom = Symbol("Ballroom")

    #Sabemos que:
    not_plum = Not(plum)
    not_ballrom = Not(ballrom)

    tools = Or(revolver, wrench, knife)
    places = Or(kitchen, library, ballrom)
    persons = Or(mustard, scarlet, plum)

    knowledge = And(tools, places, persons)
    knowledge.add(not_mustard)
    knowledge.add(not_kitchen)
    knowledge.add(not_revolver)
    knowledge.add(player2)
    knowledge.add(not_plum)
    knowledge.add(not_ballrom)
    model = model_check(knowledge, library)
    print(model)

