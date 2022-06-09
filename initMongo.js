
db.createUser({
   user: "tarpaulin",
   pwd: 'hunter2',
   roles: [
      {
         role: 'dbOwner',
	 db: 'tarpaulin'
      }
   ]
});

db = db.getSiblingDB('tarpaulin')

db.createCollection('users')


db.users.insertMany([
{
   name: "Benjiman Walsh",
   email: "walshb@oregonstate.edu",
   password: "$2a$08$vOohJ7bOICkIn24gpv40j.Xz81EDOy.84eU1FpLXobP1jIEIkSrve",
   role: "admin"

}

])



