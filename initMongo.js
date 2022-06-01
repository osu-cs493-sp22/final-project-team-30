
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



