# Read Me

I was give the task of creating a dashboard that displays the desktop visitors and mobile visitors of a site by using the BoldChat Data Extraction API, and to also implement a button that changes that availability status of an operator. Multiple challenges were faced during the devlopment of this app, but in the end, I think that I was able to pull together a functional dashboard.

## How to run
1. Make sure that you have npm and MongoDB installed
2. $ npm install
3. $ npm run start:dev

## Project Plan

The first challenge was deciding on a tech stack. My first step in choosing the stack was jotting down some high level notes:
 1. I'm going to be making AJAX requests to the BoldChat api. Does this response data need to be stored server side or can it all live client side?
    - It'd probably be a pain to constantly pass chat information around and maintain component state. A simple no-sql database would probably be ideal
 2. Information needs to be displayed on the page. Will there need to be some real-time information updates?
    - Yes. Page views will most likely increase while a user is viewing the dashboard. We'll probably want to periodically update this info.
    - Operator online status may change while viewing the page.
 3. I want to split the Dashboard and Operator pages.
 4. I'm on a time constraint, so I'll need to find a balance between working with what I know (and potentially running into a lot of headaches with the AJAX requests), and learning something new if time savings of using the library outweighs the time spent learning the new library.

I spent about 15 minutes deciding if it was feasable to implement this with just javascript, jquery, and html. I concluded that i'm not a jquery guru, and I value my sanity. It only made sense to use a front-end framework with node/ express to handle the server side MVC architecture. 

Okay great, now how about that database? I knew that i'd be learning more and more about the BoldChat API as I worked more with it, so being able to easily change the schema would be great. There's also no reason to use a rdb for such a small scale project (aside from me knowing sql more than mongo). Mongo/ Mongoose both have a ton of support, so sure, they sound good! The last step was figuring out the front-end. I've never used React before, but I liked the idea of having reusable components with component states/ properties. Maybe redux would come in handy later? 

So there we go. React for the front-end, Mongo/ Mongoose for the db, and Node/ Express for the server. I found a boilerplate that uses this stack, so that I didn't need to waste time configuring my project.

## Known Issues

- Email/ Ticket/ Chat/ Twitter online status are set to false if operator is away. This means that operators will not display on the toggle page if they're away on every client. Proper way to implement would be to get the status of each individual client for each operator. Displaying every opterator, despite their online status, would work too. My way should work for the purposes of this project, though.
- I need to implement some sort of timer to poll the BoldChat server for any changes to the userers status
- Chart does not refresh despite me putting in a time to poll user counts. I think that it's just my unfamiliarity with how react works, but i'd like to try to get this working.
- The toggle switches seem to fire off sometimes on their own. I haven't seen this happening for quite some time, but i'm digging into it to make sure that the issue is resolved.
- I think that the toggle switches were designed to spite desktop users. You need to drag your mouse to actually toggle the switch. This enusres that the user really wants to toggle the status (100% a feature, just like my minimalistic design).

## App Components

### DB Models

- Chat: storing chats would be a two step process. Step one is storing the chatID's and creation data, and step two is storing all other information about the chat that we'll need. Reasonging behind this is that the relevant information is split across two seperate BoldChat API calls.
- Operator: OperatorID, and online status for each client. Used to determine which operators need to be displayed, and what the switch status should be.

### React Components

This was a little bit challenging just due to my lack of experience with react. If I had more time, i'd read up more about the component life-cycle (willMount, didMount, didUnmount, etc.) to figure out how to better levy those in the app. 

- Operator: Operator page displays each online operator and TSwitches to toggle their availability
- TSwitch: Toggle Switches query the operator's availability and changes their status when switched. Saves toggled availability to db.
- ViewInfo: Displays desktop/ mobile visitor graph
- Profile: Page is called profile because it'd be nice to have dashboard profiles for each user. Also, it came in the boilerplate... Initializing db takes a few seconds if the database is empty, so I only wanted to do that once. Subsequent updates are done by finding the most recent chat date in my db, and calling getAllChatMessages() with a from date. This finds any chats that were created after our last update. Checks to make sure that chat isn't already stored in local db.

## Misc

### Ideas

- Add a Filters section above the dashboard. Allow user to filter on certain dates.
- Use ticker to auto update view count
    - UPDATE: Tried to do this and ran into issue. See the known issues section.
- Add the ability to view chats when clicking on one of the visitor count bars. Can appear as table below grah. Operator name can be clickable to get more metrics on operator (bring user to operator page?)

### Lessons Learned

- Redux could've been useful here. I'm not sure if I have time to go back and add it in now. 

### Questions

- At which point in the app life-cycle should I intialize data that's taken from an external API? I'm doing it from componentWillMount(), but i'm not sure if that's "best practice".

### MERN-boilerplate

This is a boilerplate project using the following technologies:
- [React](https://facebook.github.io/react/) and [React Router](https://reacttraining.com/react-router/) for the frontend
- [Express](http://expressjs.com/) and [Mongoose](http://mongoosejs.com/) for the backend
- [Sass](http://sass-lang.com/) for styles (using the SCSS syntax)
- [Webpack](https://webpack.github.io/) for compilation