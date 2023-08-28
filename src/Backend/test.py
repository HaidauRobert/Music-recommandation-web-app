logo = """
.------.            _     _            _    _            _    
|A_  _ |.          | |   | |          | |  (_)          | |   
|( \/ ).-----.     | |__ | | __ _  ___| | ___  __ _  ___| | __
| \  /|K /\  |     | '_ \| |/ _` |/ __| |/ / |/ _` |/ __| |/ /
|  \/ | /  \ |     | |_) | | (_| | (__|   <| | (_| | (__|   < 
`-----| \  / |     |_.__/|_|\__,_|\___|_|\_\ |\__,_|\___|_|\_\\
      |  \/ K|                            _/ |                
      `------'                           |__/           
"""
import random
carti=[2,3,4,5,6,7,8,9,10,10,10,10,11]
figuri=["2","3","4","5","6","7","8","9","10","J","Q","K","A"]

print(logo)
asi=0
asipc=0
r1=random.randint(0,12)
r2=random.randint(0,12)
r3=random.randint(0,12)
carte=[]
carte.append(figuri[r1])
valoarejucator=carti[r1]
carte.append(figuri[r2])
valoarejucator+=carti[r2]
cartePC=[]
cartePC.append(figuri[r3])
valoarePC=carti[r3]
if carti[r1]==11:
    asi+=1
if carti[r2]==11:
    asi+=1
if carti[r3]==11:
    asipc+=1
print(f"Ai primit urmatoarele carti: {carte[0]} , {carte[1]}")
print(f"Calculatorul are urmatoarea carte: {cartePC[0]}\n")

a=input("Mai iei o carte? DA sau NU\n").lower()
if a=="da":
    while(a=="da"):
        r = random.randint(0, 12)
        carte.append(figuri[r])
        valoarejucator += carti[r]
        if carti[r]==11:
            asi+=1
        print(f"Ai primit {figuri[r]}.")
        if valoarejucator > 21 :
            if asi>0:
                asi-=1
                valoarejucator-=10
            if valoarejucator >21:
                print(f"Valoarea cartilor tale este de {valoarejucator}, care este mai mare de 21. BUST! {carte}")
                h=1
                break
        print(f"Valoarea cartilor tale este de {valoarejucator}. {carte}")
        a=input("Mai iei o carte? DA sau NU\n").lower()

while valoarePC < 17:
    r = random.randint(0, 12)
    cartePC.append(figuri[r])
    valoarePC += carti[r]
    if carti[r]==1:
        asipc+=1
    if valoarePC>21 and asipc>0:
        valoarePC-=10
        asipc-=1
    print(f"Calculatorul a primit {figuri[r]}, avand valoarea totala de {valoarePC}. {cartePC}")

if valoarePC >21 and valoarejucator >21:
    print("EGALITATE")
elif valoarePC == valoarejucator:
    print("EGALITATE")
elif valoarePC > valoarejucator and valoarePC <22:
    print("Calculatorul castiga!")
elif valoarejucator> valoarePC and valoarejucator <22:
    print("Ai castigat!!")
elif valoarejucator <22 and valoarePC>21:
    print("Ai castigat!!")
else:
    print("Calculatorul castiga!")