# Netatmo Technical Challenge!

This repository is created to provide codes regarding the Netatmo Technical Challenge.

# How to run
Download the codes. change the terminal directory to project folder.

1. npm install
2. node app.js

## Description
The app.js files contains four functions.
1. "getTemprature" function get temperature information from "getmeasure" endpoint. it calculate min,max,average values of last 7 days of temperature by calling function "calculateMinMaxAverage".
 If the tokens are  invalid or expired it calls "getRefreshedTokens" function.
2. "getRefreshedTokens" refresh Access token and call "getTemprature" again. we count numbers of tries to prevent recursion loop.(tries < MAX_TRY)
 If refresh token was invalid invalid or expired it calls "getNewTokens" function to get new access and refresh tokens by email and password.
3. "getNewTokens" get new tokens by posting email and password. I use base64 encoded version of password, because I wanted to put this code to github. I know it is still a security flaw.
4. "calculateMinMaxAverage" calculate the result. min,max,average of the temperatures in single object traverse. 

