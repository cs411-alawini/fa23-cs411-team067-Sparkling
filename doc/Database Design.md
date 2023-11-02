## Screenshot of the database tables implemented on GCP
![image.png](https://hackmd.io/_uploads/ByvgzDl7p.png)


## Screenshot of four tables, each with >= 1000 rows
![image.png](https://hackmd.io/_uploads/rJ6OyvlQ6.png)


## DDL commands for each of tables
```mysql=
CREATE TABLE Users (
	USERID INTEGER PRIMARY KEY,
	USERNAME VARCHAR ( 255 ),
	EMAIL VARCHAR ( 255 ),
	PASSWORD VARCHAR ( 255 ) 
);
CREATE TABLE Airlines (
	IATA_CODE VARCHAR ( 2 ) PRIMARY KEY,
	AIRLINE VARCHAR ( 255 ) 
);
CREATE TABLE Airports (
	IATA_CODE VARCHAR ( 3 ) PRIMARY KEY,
	AIRPORT VARCHAR ( 255 ),
	CITY VARCHAR ( 255 ),
	STATE VARCHAR ( 2 ),
	COUNTRY VARCHAR ( 255 ),
	LATITUDE REAL,
	LONGITUDE REAL 
);
CREATE TABLE Serve (
	IATA_AIRPORT VARCHAR ( 3 ) REFERENCES Airports ( IATA_CODE ),
	IATA_AIRLINE VARCHAR ( 2 ) REFERENCES Airlines ( IATA_CODE ),
	PRIMARY KEY ( IATA_AIRPORT, IATA_AIRLINE ) 
);
CREATE TABLE Flights (
	YEAR INTEGER,
	MONTH INTEGER,
	DAY INTEGER,
	DAY_OF_WEEK INTEGER,
	AIRLINE VARCHAR ( 2 ) REFERENCES Airlines ( IATA_CODE ) ON DELETE CASCADE,
	FLIGHT_NUMBER VARCHAR ( 255 ),
	TAIL_NUMBER VARCHAR ( 255 ),
	ORIGIN_AIRPORT VARCHAR ( 3 ) REFERENCES Airports ( IATA_CODE ) ON DELETE CASCADE,
	DESTINATION_AIRPORT VARCHAR ( 3 ),
	SCHEDULED_DEPARTURE INTEGER,
	DEPARTURE_TIME INTEGER,
	DEPARTURE_DELAY INTEGER,
	TAXI_OUT INTEGER,
	WHEELS_OFF INTEGER,
	SCHEDULED_TIME INTEGER,
	ELAPSED_TIME INTEGER,
	AIR_TIME INTEGER,
	DISTANCE INTEGER,
	WHEELS_ON INTEGER,
	TAXI_IN INTEGER,
	SCHEDULED_ARRIVAL INTEGER,
	ARRIVAL_TIME INTEGER,
	ARRIVAL_DELAY INTEGER,
	DIVERTED BOOL,
	CANCELLED BOOL,
	CANCELLATION_REASON CHAR,
	AIR_SYSTEM_DELAY INTEGER,
	SECURITY_DELAY INTEGER,
	AIRLINE_DELAY INTEGER,
	LATE_AIRCRAFT_DELAY INTEGER,
	WEATHER_DELAY INTEGER,
	PRIMARY KEY ( YEAR, MONTH, DAY, FLIGHT_NUMBER, AIRLINE ) 
);
CREATE TABLE Feedbacks (
	FEEDBACKID INTEGER PRIMARY KEY,
	USERID INTEGER REFERENCES Users ( USERID ) ON DELETE CASCADE,
	YEAR INTEGER,
	MONTH INTEGER,
	DAY INTEGER,
	FLIGHT_NUMBER VARCHAR ( 255 ),
	AIRLINE VARCHAR ( 2 ),
	CONTENT VARCHAR ( 255 ),
FOREIGN KEY ( YEAR, MONTH, DAY, FLIGHT_NUMBER, AIRLINE ) REFERENCES Flights ( YEAR, MONTH, DAY, FLIGHT_NUMBER, AIRLINE ) ON DELETE CASCADE 
);
```


## Advanced Queries and Indexing Analysis

### query 1

This query has obtained the average delay duration for each airline for the entire year of 2015. Alaska Airlines was temporarily excluded because the average delay was a negative value which means on average, they arrive early rather than late.


```mysql=
SELECT IATA_CODE,
	a.AIRLINE,
	AVG(ARRIVAL_DELAY) as AVG_Delay_Time_Min
FROM Airlines a
JOIN Flights f ON a.IATA_CODE = f.AIRLINE
GROUP BY IATA_CODE,AIRLINE
HAVING AVG_Delay_Time_Min > 0
ORDER BY AVG_Delay_Time_Min DESC;
-- output no more than 15, only 13 airlines have an average delay time greater than 0
```
#### output
output no more than 15, only 13 airlines have an average delay time greater than 0
![截屏2023-11-01 18.53.36.png](https://hackmd.io/_uploads/HypWHwlXT.png)

#### Indexing Analysis


##### before adding indexes
![image.png](https://hackmd.io/_uploads/Hkhg-9xXT.png)

![image.png](https://hackmd.io/_uploads/rkhNiPeQ6.png)

##### indexing design 1: index on Flights.ARRIVAL_DELAY
![image.png](https://hackmd.io/_uploads/Sko_ece7p.png)

![image.png](https://hackmd.io/_uploads/BJXpOqgQa.png)

It can be seen that creating a index on ARRIVAL_DELAY speeds up the query by 1.5s. It could be that by indexing on ARRIVAL_DELAY, the well-ordered ARRIVAL_DELAY between each group speeds up the `ORDER BY` a bit.


##### indexing design 2: index on Flights.DEPARTURE_DELAY
Since there are no extra attributes in query 1 available for indexing, here i attempt to creating a index that is not used.

![image.png](https://hackmd.io/_uploads/HkEQJilmT.png)

![image.png](https://hackmd.io/_uploads/Hk64boxmT.png)

It can be seen that creating a index that is not used in query does not help.


##### indexing design 3: index on Airlines.IATA_CODE
Since there are no extra attributes in query 1 available for indexing, here i attempt to creating the same index twice.
![image.png](https://hackmd.io/_uploads/SyTc4qxm6.png)

It can be seen that creating a index twice does not help.


### query 2

This query has obtained the average delay duration in 2015 for each airline at each airport. We will temporarily select UA and AA, which have the most flights, for analysis.

```mysql=
SELECT IATA_CODE,
	AIRPORT,
	AIRLINE,
	AVG(ARRIVAL_DELAY) as AVG_Delay_Time_Min
FROM Airports a
JOIN Flights f ON f.ORIGIN_AIRPORT = a.IATA_CODE
WHERE AIRLINE = 'AA'
GROUP BY IATA_CODE
HAVING AVG_Delay_Time_Min > 0

UNION

SELECT IATA_CODE,
	AIRPORT,
	AIRLINE,
	AVG(ARRIVAL_DELAY) as AVG_Delay_Time_Min
FROM Airports a
JOIN Flights f ON f.ORIGIN_AIRPORT = a.IATA_CODE
WHERE AIRLINE = 'UA'
GROUP BY IATA_CODE
HAVING AVG_Delay_Time_Min > 0
LIMIT 15;
```




#### output
![截屏2023-11-01 18.54.12.png](https://hackmd.io/_uploads/r1GEBPgXa.png)

#### Indexing Analysis
##### before adding indexes
![image.png](https://hackmd.io/_uploads/HyNsqqeXp.png)

![image.png](https://hackmd.io/_uploads/SJeA55gXp.png)


##### indexing design 1: index on Flights.ORIGIN_AIRPORT
![image.png](https://hackmd.io/_uploads/H1JB9qeQT.png)

![image.png](https://hackmd.io/_uploads/SyFD55gmp.png)
It can be seen that indexing on Flights.ORIGIN_AIRPORT does not help much 
##### indexing design 2: index on Flights.AIRLINE
Since there are no extra attributes in query 2 available for indexing, here i attempt to creating a index twice.
![image.png](https://hackmd.io/_uploads/ryEK39l7a.png)

![image.png](https://hackmd.io/_uploads/Sy6n35x7a.png)
It can be seen that indexing on the same attribute twice does not help much. 

##### indexing design 3: index on Flights.TAXI_OUT
Since there are no extra attributes in query 2 available for indexing, here i attempt to creating a index on an TAXI_OUT attribute that is not used in query 2.

![image.png](https://hackmd.io/_uploads/rk5oacem6.png)

![image.png](https://hackmd.io/_uploads/H1hTp9lQ6.png)
We can see that indexing on Flights.TAXI_OUT does not help a lot, because TAXI_OUT does not even participate in the query.