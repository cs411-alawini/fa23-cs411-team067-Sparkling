#### Sprkling US Flights Delay Search Platform Description

------

> CS 411 Track1 Group Work
>
> Team Name: Sparkling
>
> Team Number: 067
>
> Member 1: Chenglin Miao cmiao7@illinois.edu
> Member 2: Tianxingjian Ding tding10@illinois.edu
> Member 3: Wei Chen weic6@illinois.edu
> Member 4: Bo Zhao bozhao6@illinois.edu

##### 1. Describe what data is stored in the database. (Where is the data from, and what attributes and information would be stored?)
The dataset pertains to 2015 flight delays and cancellations from the U.S. Department of Transportation's (DOT) Bureau of Transportation Statistics. There are three csv files which are ‘airlines.csv’, ‘airports.csv’ and ‘flights.csv’ in this dataset.

airlines.csv contains two columns:
1. IATA_CODE (airlines identifier)
2. AIRLINE (airport’s name)

airports.csv contains seven columns:
1. IATA_CODE (location identifier)
2. AIRPORT (airport’s name)
3. CITY
4. STATE
5. COUNTRY (country name of the airport)
6. LATITUDE (latitude of the airport)
7. LONGITUDE (longitude of the airport)

flights.csv contains thirty-one columns:
1. YEAR (year of the flight trip)
2. MONTH (month of the flight trip)
3. DAY (day of the flight trip)
4. DAY_OF_WEEK (Day of week of the Flight Trip)
5. AIRLINE (Airline Identifier)
6. FLIGHT_NUMBER (Flight Identifier)
7. TAIL_NUMBER (Aircraft Identifier)
8. ORIGIN_AIRPORT (Starting Airport)
9. DESTINATION_AIRPORT (Destination Airport)
10. SCHEDULED_DEPARTURE (Planned Departure Time)
11. DEPARTURE_TIME (WHEEL_OFF - TAXI_OUT)
12. DEPARTURE_DELAY (Total Delay on Departure)
13. TAXI_OUT (The time duration elapsed between departure from the origin airport gate and wheels off)
14. WHEELS_OFF (The time point that the aircraft's wheels leave the ground)
15. SCHEDULED_TIME (Planned time amount needed for the flight trip)
16. ELAPSED_TIME (AIR_TIME+TAXI_IN+TAXI_OUT)
17. AIR_TIME (The time duration between wheels_off and wheels_on time)
18. DISTANCE (Distance between two airports)
19. WHEELS_ON (The time point that the aircraft's wheels touch on the ground)
20. TAXI_IN (The time duration elapsed between wheels-on and gate arrival at the destination airport)
21. SCHEDULED_ARRIVAL (Planned arrival time)
22. ARRIVAL_TIME (WHEELS_ON+TAXI_IN)
23. ARRIVAL_DELAY (ARRIVAL_TIME-SCHEDULED_ARRIVAL)
24. DIVERTED (Aircraft landed on airport that out of schedule)
25. CANCELLED (Flight Cancelled (1 = cancelled))
26. CANCELLATION_REASON (Reason for Cancellation of flight: A-Airline/Carrier; B-Weather; C-National Air System; D-Security)
27. AIR_SYSTEM_DELAY (Delay caused by air system)
28. SECURITY_DELAY (Delay caused by security)
29. AIRLINE_DELAY (Delay caused by the airline)
30. LATE_AIRCRAFT_DELAY (Delay caused by aircraft)
31. WEATHER_DELAY (Delay caused by weather)


##### 2. What are the basic functions of your web application? (What can users of this website do? Which simple and complex features are there?)


2.1 Search flights-delay data

| Function                               | Request | API                                             |
| -------------------------------------- | ------- | ----------------------------------------------- |
| search delay-history of airports       | get     | delay-history/airports/chicago/ord/             |
| search delay-history of cities         | get     | Delay-history/cities/chicago/                   |
| search delay-history of flight numbers | get     | delay-history/flight-number/FM781/              |
| Passagers feedback                     | post    | flights/passagers/feedback/date/airport/airline |

2.2 flights-delay map by state

Visualize departure and arrival delays for the USA by state. Use maps to display delay conditions at different airports. Color-coding can represent the severity of delays, making it easy to see at a glance.

<img src="https://s2.loli.net/2023/09/11/xGJL8aHnPOflVdK.png" alt="image-20230910135829248" style="zoom:40%;" />

2.3 flights-delay data analysis

- Create bar charts or line graphs displaying the average delay times for each airport or airline. This can help decision-makers identify locations or operators with the most severe delays.
- Create pie charts or radar charts to show the relative proportions of various delay causes, such as weather, air traffic control, technical issues, etc. This can help decision-makers understand the primary reasons for delays. (demo)

<img src="https://s2.loli.net/2023/09/11/s9QHk4hq3BbM6VO.png" alt="image-20230910142139448" style="zoom: 25%;" />

2.4 flights-delay data analysis

Passengers input their departure location, destination, and departure time. The website will then recommend flights based on airport names, airline companies, and flight numbers, sorted in descending order of on-time performance. Passengers can prioritize selecting flights with the highest on-time rates at the top of the list.

##### 3. What would be a good creative component (function) that can improve the functionality of your application? (What is something cool that you want to include? How are you planning to achieve it?)

Flight Recommendation Feature: Passengers input their departure location, destination, and departure time. The website will then recommend flights based on airport names, airline companies, and flight numbers, sorted in descending order of on-time performance. Passengers can prioritize selecting flights with the highest on-time rates at the top of the list.

##### 4. Project Title

Sprkling US Flights Delay Search Platform

##### 5. Project Summary:  It should be a 1-2 paragraph description of what your project is.

The Flight Recommendation Feature enhances our application's functionality by allowing passengers to input their travel details, including departure location, destination, and departure time. Based on this information, the application leverages data on airport names, airline companies, and flight numbers, ranking them in descending order of on-time performance. This empowers passengers to make informed choices, giving priority to flights with the best punctuality. This feature not only provides convenience but also contributes to a smoother travel experience, aligning with our commitment to delivering valuable travel insights and services.

##### 6. Description of an application of your choice. State as clearly as possible what you want to do. What problem do you want to solve, etc.?

The frontend is the same with Question 2. 
Backend developers will design schema of tables and manage data storage. Tables for airlines, airports, flights, passengers' feedback will be created and data will be stored. 
Four APIs will be created and maintaind to retrieve data according to different requests. Aggragated data will be formatted and sent to frontend.


##### 7. Usefulness. Explain as clearly as possible why your chosen application is useful.  Make sure to answer the following questions: Are there any similar websites/applications out there?  If so, what are they, and how is yours different?

Our website can offer accurate flight delay-data search and flight recommendation based on time accuracy, which will improve tour experience of passagers. Delay-data visualization part generates an explicit analysis of delay reasons, which will make it clear to schedule more accurate flights. There is a similar websit: https://github.com/lrakai/us-flight-delays. Our application refers to it, but has two other functions: Delay-history data search and Delay-history data analysis visualization, so we can say the github repo is a part function of our application.

##### 8. Realness.  Describe what your data is and where you will get it.

The dataset is offered by TAs of CS411, which pertains to 2015 flight delays and cancellations from the U.S. Department of Transportation's (DOT) Bureau of Transportation Statistics. There are three csv files which are **‘airlines.csv’**, **‘airports.csv’** and **‘flights.csv’** in this dataset.

##### 9. Description of the functionality that your website offers. This is where you talk about what the website delivers. Talk about how a user would interact with the application (i.e., things that one could create, delete, update, or search for). 

##### 9.1 A low-fidelity UI mockup: What do you imagine your final application’s interface might look like? A PowerPoint slide or a pencil sketch on a piece of paper works!
   A sketch of the UI interface can be found here:
 https://framer.com/projects/PT1-draft-1--Si4CR0fk3G3NpH27Nfbc-iBkEP
##### 9.2 Project work distribution: Who would be responsible for each of the tasks or subtasks?

| Member            | Classification | Functions                                                    |
| ----------------- | -------------- | ------------------------------------------------------------ |
| Chenglin Miao     | Frontend       | Data Search, Flight recommendation, Visualization            |
| Tianxingjian Ding | Frontend       | UI Design, History Analysis                                  |
| Wei Chen          | Backend        | Database Management, API Development, Optimization and Testing |
| Bo Zhao           | Backend        | Database Management (data filtering, query, organization...), API Development, Optimization and Testing |

##### 9.3 List of the person responsible for which exact functionalities in section 6. Explain how backend systems will be distributed across members. 

Both Wei Chen and Bo Zhao will be responsible for the work in section 6 and other backend-related tasks.

Bo Zhao: Design schema of tables and manage data storage. Tables for airlines, airports, flights, passengers’ feedback will be created and data will be sorted and stored.

Wei Chen: Four APIs will be created and maintaind to retrieve data according to different requests. Aggragated data will be formatted and sent to frontend.