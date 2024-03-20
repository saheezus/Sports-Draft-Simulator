import { request, response } from "express";

// Description of every pick being made
type Pick = {
  option: string,
  drafter: string,
  num: number
}

// Description of a draft and all the drafters and picks involved
// RI: rounds >= 0, len(options) > 0, len(drafters) > 0
type Draft = {
  picks: Pick[],
  drafters: string[],
  rounds: number, 
  options: string[],
  turn: string
}

// Map of drafts and their respective ID's
const drafts: Map<number, Draft> = new Map();

let maxID: number = 0;

/**
 * Returns a specific draft and its contents given a draft ID
 * @param req containing the draft ID
 * @param res the draft and the current pick number (if more than 0)
 * @returns a draft object
 */
export function getDraft(req: request, res: response) {
  const id = req.query.id;
  if (id === undefined || typeof id !== 'string') {
    res.status(400).send("invalid id");
    return;
  }
  if (drafts.get(Number(id)) === undefined) {
    res.send({draft: "none"})
    return;
  }
  const draft = drafts.get(Number(id));
  if (draft !== undefined) {
    if (draft.picks.length > 0) {
      const p = draft.picks[draft.picks.length - 1];
      const num = p.num + 1;
      res.send({draft: draft, num: num});
    } else {
      res.send({draft: draft});
    }
  }
}

/**
 * Creates a new draft with possible options, drafters, and rounds, and stores it in the map
 * @param req containing list of options, drafters, and number of rounds
 * @param res sends back the created draft object and its respective id
 */
export function createDraft(req: request, res: response) {
  const newID = maxID + 1;

  const options = req.body.options;
  if (options === undefined || typeof options !== 'string') {
    res.status(400).send("invalid options");
    return;
  }

  const rounds = req.body.rounds;
  if (rounds === undefined || typeof rounds !== 'string' || Number(rounds) === 0) {
    res.status(400).send("invalid rounds");
    return;
  }

  const drafters = req.body.drafters;
  if (drafters === undefined || typeof drafters !== 'string') {
    res.status(400).send("invalid list of drafters")
    return;
  }

  const optionsArr = options.split(/\r?\n/);
  const draftersArr = drafters.split(/\r?\n/);

  const newDraft = {
    picks: [],
    drafters: draftersArr,
    rounds: Number(rounds),
    options: optionsArr,
    turn: draftersArr[0],
  }
  drafts.set(newID, newDraft);
  maxID += 1;
  res.send({id: newID, draft: newDraft})
}

/**
 * Stores a pick with the associted person drafting, the pick number, and the actual selection
 * @param req containg the draft id, the selection, the drafter, and the pick number
 * @param res returns the updated draft object 
 * @modifies the draft object and removes the selection from the list of available selections that can be made
 */
export function makePick(req: request, res: response) {
  const id = req.body.id;
  if (id === undefined) {
    res.status(400).send("invalid id");
    return;
  }
  const draft = drafts.get(Number(id));

  if (draft !== undefined) {  
    const option = req.body.option;
    if (option === undefined) {
      res.status(400).send("invalid pick")
    }

    const drafter = req.body.drafter;
    if (drafter === undefined) {
      res.status(400).send("invalid drafter");
    }

    const num = req.body.number;
    if (num == undefined || typeof num !== "number") {
      res.status(400).send("invalid pick number")
    }

    draft.picks.push({option: option, drafter: drafter, num: num});
    draft.options = draft.options.filter(item => item !== option);
    let idx = draft.drafters.indexOf(draft.turn);
    if (idx === draft.drafters.length - 1) {
      idx = 0;
      draft.rounds -= 1;
    } else {
      idx += 1;
    }
    draft.turn = draft.drafters[idx];
    res.send({option: option, drafter: drafter, draft: draft, num: num})
  } 
}
