# DineIn

Technologies: node js, express, Pug, MongoDb, mongoose, Passport.

Purpose: This is web application where small catering business can post their weekly menu and menu. The users can find them by location. The businesses will post their contact information and some other information such as(delivery options, processing time, area covered etc). Customers can contact them after seeing the menu and place an order using the phone number. If User successfully logs in, they are redirected to a page with
all the routes provided. Click on the arrow and the user will be redirected to the page.

Features:
->->Authentication and Authorization is done by passport library.
Passport is implemented by local strategy. Password is hashed using bcrypt package. if a user can not login the application will be in landing page. Routes are protected. User can also log out.

->->Weekly Menu and Menus are posted by Html form.

->->Services are rendered using pug from Mongodb. If a new menu is posted then it will be rendered instantly.

->->Users can edit their information such as password, address, contact number.

->->Services can edit their post. If a service logs in and clicks on edit menu then he is redirected to a page with the old menu in input fields.
They can change it as they wish and submit it again. Changes will reflect.

For every routes use this email and password:
mango@hotmail.com
mango123
