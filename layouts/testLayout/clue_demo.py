from logic import *

# personas (or)
# lugares (or)
# herram (or)

# personajes
mustard = Symbol("Mustard")
plum = Symbol("Plum")
scarlet = Symbol("Scarlet")
characters = [mustard, plum, scarlet]

# rooms 
ballroom = Symbol("Ballroom")
library = Symbol("Library")
kitchen = Symbol("Kitchen")
rooms = [ballroom, library, kitchen]

# herrams
knife  = Symbol("Knife")
revolver = Symbol("Revolver")
wrench = Symbol("Wrench")
tools = [knife, revolver, wrench]

Knowledge = And(
    Or(mustard, plum, scarlet),
    Or(ballroom, library, kitchen),
    Or(knife, revolver, wrench)
)

symbols = characters + rooms + tools

def check_knowledge(knowledge):
    for symbol in symbols:
        if model_check(Knowledge, symbol):
            print(f"{symbol}: YES")
        elif not model_check(Knowledge, Not(symbol)):
            print(f"{symbol}: MAYBE")

# ------- E V E N T O S -------
# cartas iniciales
Knowledge.add(
    And(
        Not(mustard),
        Not(kitchen),
        Not(revolver)
    )
)

# unknown cards
Knowledge.add(
    Or(
        Not(scarlet),
        Not(library),
        Not(wrench)
    )
)

# known cards
Knowledge.add(Not(plum))

Knowledge.add(Not(ballroom))

# ----------------------------
check_knowledge(Knowledge)