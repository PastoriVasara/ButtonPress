## Information

the server compares the data user posts to server to the data which is stored in the database.
If for example the user modifies their score to be extremely high the server checks the previous stored value of the score 
and if the difference is too high it won't process the request.

The username is compared to a token which the server generates and stores to the database. 
If there is any difference it won't process the request.

When user registers to the website the password will be hashed with bcrypt and the hash is stored to the database,
and when a user tries to log in it compares the log-in information with the hashed password and if it matches up the user will be granted access
