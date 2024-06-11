
from .models import Couple, Story, Program, Witness
from . import db


def generate_witness():
    Witness.query.delete()
    db.session.commit()

    side = ["Groomsman", "Groomsman", "Groomsman", "Bridesmaid", "Bridesmaid", "Bridesmaid", ]
    full_name = ["John Doe", "Tim Allan", "Bill Something", "Maria Carey", "Jane Dae", "Someone"]
    for i in range(len(full_name)):
        witness = Witness(  id=i,
                            side=side[i], 
                            full_name=full_name[i],
                            description="Best Friend")
        db.session.add(witness)
        db.session.commit()
        
    return "ok", 202



def generate_partners():
    Couple.query.delete()
    db.session.commit()
    partner1 = Couple(id=1, 
                       full_name="David Beckham" ,
                       description="A very nice footballer")
    partner2 = Couple(id=2, 
                       full_name="Victoria Beckham", 
                       description="A very nice singer")

    # add the new user to the database
    db.session.add(partner1)
    db.session.add(partner2)
    db.session.commit()
    return "ok", 202


def generate_story():
    Story.query.delete()
    db.session.commit()

    titles = ["First Meet", "First Date", "Proposal", "Engagement"]
    dates = ["10 Jan 2020", "13 Mar 2021", "16 Jun 2022", "19 Sep 2023"]
    for i in range(4):
        lovepart = Story(id=i,
                             title=titles[i], 
                             date=dates[i], 
                             description="Any description you want to put there...",
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
                            description="Write what is going to happen")
        db.session.add(program)
        db.session.commit()
        
    return "ok", 202

