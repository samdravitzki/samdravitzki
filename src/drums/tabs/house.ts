import { Tab } from "./Tab";

// prettier-ignore
const houseTab: Tab = {
    name: "house",
    pattern: {
        "K":    [1, 0, 1, 0, 1, 0, 1, 0],
        "C":    [0, 0, 1, 0, 0, 0, 1, 0],
        "HH":   [1, 0, 1, 0, 1, 0, 1, 0],
        "OH":   [0, 1, 0, 1, 0, 1, 0, 1],
        "S":    [0, 0, 0, 0, 0, 0, 0, 0],
    }
}

export default houseTab;
