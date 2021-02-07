import React from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";

function DataEntry(props) {
  return (
    <>
      <Col>
        <Row className="mb-2">
          <Col xs lg="8">
            <Form.Group>
              <Form.Label>Enter Name</Form.Label>
              <Form.Control
                type="text"
                id="name"
                placeholder="Your Name Here"
                onChange={(event) => {
                  props.handleUpdateUsername(event.target.value);
                }}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-2">
          <Button
            variant="success"
            size="lg"
            className="StartButton"
            onClick={props.handleSetUsername}
          >
            Submit
          </Button>
        </Row>
      </Col>
    </>
  );
}

export default DataEntry;
