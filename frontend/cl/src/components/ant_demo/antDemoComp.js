import React, {Component} from 'react';
// Access all components from `muicss/react` module
import {
    Appbar,
    Button,
    Container,
    Checkbox,
    Select,
    Option,
    Dropdown,
    DropdownItem
} from 'muicss/react';

const AntDemoComponent = () => {
    return (<div>
        <Appbar></Appbar>
        <Container>
            <Button color="primary">button</Button>
            <form>
                <Checkbox name="inputA1" label="Option one" defaultChecked={true}/>
                <Checkbox name="inputA2" label="Option two"/>
                <Checkbox name="inputA3" label="Option three is disabled" disabled={true}/>

                <Select name="input" label="Select Example" defaultValue="option2">
                    <Option value="option1" label="Option 1"/>
                    <Option value="option2" label="Option 2"/>
                    <Option value="option3" label="Option 3"/>
                    <Option value="option4" label="Option 4"/>
                </Select>
            </form>
            <Dropdown color="primary" label="Dropdown">
                <DropdownItem link="#/link1">Option 1</DropdownItem>
                <DropdownItem>Option 2.5</DropdownItem>
                <DropdownItem>Option 3</DropdownItem>
                <DropdownItem>Option 4</DropdownItem>
            </Dropdown>
        </Container>
    </div>);
}

export default AntDemoComponent;
