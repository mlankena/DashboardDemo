import React, { Component } from 'react';
import {well, Button, Grid, Jumbotron, Row, Col} from 'react-bootstrap';
import 'whatwg-fetch';

//const wellStyle = {background: 'rgb(245, 245, 245, 0.9)'};

const Home = () => (
  <Grid>
    <Jumbotron>
      <Row className="show-grid">
        <h2>Chose what you want to do!</h2>
        <br />
        <p>You can view visitor counts on the dashboard, or set your operator's availability!</p>
      </Row>
    </Jumbotron>
    <div className="well">
      <Button href="/profile" bsStyle="primary" bsSize="large" block>View Dashboard</Button>
      <Button href="/operator" bsSize="large" block>View Operators</Button>
    </div>
  </Grid>
)

export default Home;
