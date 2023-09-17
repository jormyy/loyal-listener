# loyal-listener

## Description
This web application uses the Spotify web API to create a playlist that includes all of an artist's songs.

## Usage
Unfortunately the Spotify web API only grants access to authenticated users. If you wish to use this app, please send me a message on the "Contact Me" section of my portfolio at https://jormyy.github.io/portfolio/ with your full name and email. Once authenticated, you can access the application at https://jorm.pythonanywhere.com.
<br> <br>
Alternatively, you could use the code in the repository and run the application locally.
1. Clone the repository.
2. Create an app with https://developer.spotify.com.
3. Set the redirect URI to http://localhost:5000/callback.
4. Create a file called .env and create variables, ```CLIENT_ID``` and ```CLIENT_SECRET```, and set them equal to the client id and client secret that is provided by your app.
5. Type ```pip install -r requirements.txt``` in your working directory.
6. Run main.py on your local device.
