# DineIn

## Technologies:

node js, express, Pug, MongoDb, mongoose, Passport.

## Purpose:

This is web application where small catering business can post their weekly menu and menu. The users can find them by location. The businesses will post their contact information and some other information such as(delivery options, processing time, area covered etc). Customers can contact them after seeing the menu and place an order using the phone number. If User successfully logs in, they are redirected to a page with all the routes provided. Click on the arrow and the user will be redirected to the page.

## Models:

Contains all the database schema:
->Weekly posting
->Menu posting
->User schema

## Views:

Contains all the User Interface files:
-Landing page(animation, Login box, information and Footer).
-Registration page.
-Update user information.
-Weekly-Menu post page.
-Search weekly Menu By Location.
-Each Weekly Menu Details page.
-Update Weekly Menu.
-Menu post page.
-Search Menu By Location.
-Each Menu Details page.
-About Page.
-404 Not Found.

## Routes && Features :

-app.js Contains all the Routes.

## ->->Authentication and Authorization is done by passport library

Passport is implemented by local strategy. Password is hashed using bcrypt package. if a user can not login the application will show the error using flash messages. Routes are protected. Unauthorized user can not access any page without About and Landing page. If an unauthorized user tries to gain access he will be redirected to landing page for login. User can go to register page from there.

## ->->Weekly Menu and Menus are posted by Html form

This is a HTML page with input fields. The page requires user to enter required information such as (Service name, Location, Service methods, Phonenumber, Picture, Social media link). User can enter up to 3 menus and prices for Weekly menu. For normal menu, user can enter many items with servings and price for each. There is a form-validator so that, user cannot post a form without entering required information. Required fields are marked required. Data is saved in the database.

## ->->Rendering Dynamic Pages

All information of service's are retrieved from database and rendered with pug. When user goes to weekly menu posts page, it shows all the services with image and little information. There is a search bar on the top, where user can type in the location of area name and thhe services that includes the area name will show up. User
can click on each of them, it will take it to the details page. The details page will have background of image, the user provided when posting their information. Items and menus will show up in fashion.

## ->-> Edit information

->Users can edit their information such as password, address, contact number.

->Services can edit their post. If a service logs in and clicks on edit menu then he is redirected to a page with the old menu in input fields.
They can change it as they wish and submit it again. Changes will reflect.
