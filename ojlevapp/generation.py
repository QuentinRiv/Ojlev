
from .models import Partner, Lovestory, Program, Witness
from . import db


def generate_witness():
    Witness.query.delete()
    db.session.commit()

    side = ["Groomsman", "Groomsman", "Groomsman", "Bridesmaid", "Bridesmaid", "Bridesmaid", ]
    full_name = ["Albert Einstein", "Thierry Lermit", "Igor Meideleyeiv", "Marie Curie", "Frida Khalo", "Mahitée"]
    for i in range(len(full_name)):
        witness = Witness(  id=i,
                            side=side[i], 
                            full_name=full_name[i],
                            description="Best Friend")
        db.session.add(witness)
        db.session.commit()
        
    return "ok", 202



def generate_partners():
    Partner.query.delete()
    db.session.commit()
    partner1 = Partner(id=1, 
                       full_name="Jean Bonbeurre" ,
                       description="A very nice lad")
    partner2 = Partner(id=2, 
                       full_name="Jeanne Haitte", 
                       description="A very nice girl")

    # add the new user to the database
    db.session.add(partner1)
    db.session.add(partner2)
    db.session.commit()
    return "ok", 202


def generate_story():
    Lovestory.query.delete()
    db.session.commit()

    titles = ["First Meet", "First Date", "Proposal", "Engagement"]
    dates = ["10 Jan 2020", "13 Mar 2021", "16 Jun 2022", "19 Sep 2023"]
    for i in range(4):
        lovepart = Lovestory(id=i,
                             title=titles[i], 
                             date=dates[i], 
                             description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam officiis doloribus nulla placeat voluptatibus eum quidem fugit eius impedit, asperiores molestiae natus saepe doloremque, exercitationem quo error iure optio debitis.",
                             image_name="story-"+str(i)+".jpg")
        db.session.add(lovepart)
        db.session.commit()
        
    return "ok", 202


def generate_program():
    Program.query.delete()
    db.session.commit()

    names = ["Ceremony", "Engagement"]
    dates = ["16 Jun 2022", "19 Sep 2023"]
    hours = ["5:00 - 7:00 PM", "5:00 - 7:30 PM"]
    for i in range(2):
        program = Program(  id=i+1,
                            name=names[i], 
                            date=dates[i], 
                            time=hours[i],
                            description="Machin truc muche")
        db.session.add(program)
        db.session.commit()
        
    return "ok", 202

