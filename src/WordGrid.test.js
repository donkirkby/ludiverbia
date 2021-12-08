import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import WordGrid from './WordGrid';

test('starts with no words', () => {
  render(<WordGrid />);
  const oldWords = screen.queryAllByRole("row");
  const addWord = screen.getByRole("textbox");

  expect(oldWords.length).toBe(1);  // Row for adding another word.
  expect(addWord).toHaveFocus();
});

test('starts with properties', () => {
  render(<WordGrid
    startWord="Example"
    midWord="name"
    endWord="Other"
    newWord="Another"/>);
  const oldWords = screen.queryAllByRole("row");
  expect(oldWords.length).toBe(4);
  expect(oldWords[0]).toHaveTextContent("EXAMPLE");
  expect(oldWords[1]).toHaveTextContent("NAME");
  expect(oldWords[2]).toHaveTextContent("OTHER");

  expect(screen.getByRole("textbox")).toHaveValue("Another");
});

test('add a word', () => {
  render(<WordGrid />);
  const newWord = screen.getByRole("textbox"),
    addButton = screen.getByText("Add");
  expect(newWord).toHaveValue("");
  expect(addButton).toBeDisabled();

  fireEvent.change(newWord, {target: {value: "Example"}});

  expect(newWord).toHaveValue("Example");
  expect(addButton).toBeEnabled();

  fireEvent.click(addButton);

  const oldWords = screen.queryAllByRole("row");
  expect(oldWords.length).toBe(2);
  expect(oldWords[0]).toHaveTextContent("EXAMPLE");
});

test('add a word with enter key', () => {
  render(<WordGrid />);
  const newWord = screen.getByRole("textbox");

  userEvent.type(newWord, "Example{enter}");

  const oldWords = screen.queryAllByRole("row");
  expect(oldWords.length).toBe(2);
  expect(oldWords[0]).toHaveTextContent("EXAMPLE");
});

test('add a second word', () => {
  render(<WordGrid startWord="example" newWord="later"/>);
  const addButton = screen.getByText("Add");

  fireEvent.click(addButton);

  const oldWords = screen.queryAllByRole("row");
  expect(oldWords.length).toBe(3);
  expect(oldWords[1]).toHaveTextContent("LATER");
});

test('add a second word earlier', () => {
  render(<WordGrid startWord="example" newWord="earlier"/>);
  const addButton = screen.getByText("Add");

  fireEvent.click(addButton);

  const oldWords = screen.queryAllByRole("row");
  expect(oldWords.length).toBe(3);
  expect(oldWords[0]).toHaveTextContent("EARLIER");
  expect(oldWords[1]).toHaveTextContent("EXAMPLE");
});

test('add a third word between', () => {
  render(<WordGrid startWord="apple" endWord="zebra" newWord="nurse"/>);
  const buttons = screen.queryAllByRole("button");
  expect(buttons.length).toBe(1);
  expect(buttons[0]).toHaveTextContent("Add");

  fireEvent.click(buttons[0]);

  const oldWords = screen.queryAllByRole("row");
  expect(oldWords.length).toBe(4);
  expect(oldWords[0]).toHaveTextContent("APPLE");
  expect(oldWords[1]).toHaveTextContent("NURSE");
  expect(oldWords[2]).toHaveTextContent("ZEBRA");

  const buttonsAfter = screen.queryAllByRole("button");
  expect(buttonsAfter.length).toBe(3);
  expect(buttonsAfter[0]).toHaveTextContent("Bet Before");
  expect(buttonsAfter[1]).toHaveTextContent("Bet After");
  expect(buttonsAfter[2]).toHaveTextContent("Add");
});

test('type a third word before', () => {
  render(<WordGrid startWord="avocado" endWord="zebra" newWord="apple"/>);
  const addButton = screen.getByText("Add");

  expect(addButton).toBeDisabled();
});

test('type a third word after', () => {
  render(<WordGrid startWord="avocado" endWord="zebra" newWord="zulu"/>);
  const addButton = screen.getByText("Add");

  expect(addButton).toBeDisabled();
});

test('add a fourth word early', () => {
  render(<WordGrid
    startWord="apple"
    midWord="nurse"
    endWord="zebra"
    newWord="candy"/>);
  const addButton = screen.getByText("Add");

  fireEvent.click(addButton);

  const oldWords = screen.queryAllByRole("row");
  expect(oldWords.length).toBe(4);
  expect(oldWords[0]).toHaveTextContent("APPLE");
  expect(oldWords[1]).toHaveTextContent("CANDY");
  expect(oldWords[2]).toHaveTextContent("NURSE");
});

test('add a fourth word late', () => {
  render(<WordGrid
    startWord="apple"
    midWord="nurse"
    endWord="zebra"
    newWord="opera"/>);
  const addButton = screen.getByText("Add");

  fireEvent.click(addButton);

  const oldWords = screen.queryAllByRole("row");
  expect(oldWords.length).toBe(4);
  expect(oldWords[0]).toHaveTextContent("NURSE");
  expect(oldWords[1]).toHaveTextContent("OPERA");
  expect(oldWords[2]).toHaveTextContent("ZEBRA");
});
