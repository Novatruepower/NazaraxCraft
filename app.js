let currentWidth = 0;
let lastBtnRefresh = null;
const scaleWidthPercentReference = 0.04;

const EArmorType = {
    SuperLight: "superlight",
    Light: "light",
    Normal: "normal",
    Heavy: "heavy",
    SuperHeavy: "superheavy",
};

const EArmorLocation = {
    Head: "Head",
    Body: "Body",
    Leg: "Leg",
    Shield: "Shield",
};

const EArmor = {
    top: { name: "Top", loc: EArmorLocation.Head },
    mid: { name: "Mid", loc: EArmorLocation.Body },
    low: { name: "Low", loc: EArmorLocation.Leg },
    buckler: { name: "Buckler", loc: EArmorLocation.Shield },
    roundshield: { name: "RoundShield", loc: EArmorLocation.Shield },
    greatshield: { name: "GreatShield", loc: EArmorLocation.Shield },
    bulwark: { name: "Bulwark", loc: EArmorLocation.Shield },
    aegis: { name: "Aegis", loc: EArmorLocation.Shield }
}

const craftingQTYData = {
    Head: 3,
    Body: 4,
    Leg: 3,
    Shield: 3
}

const Reuse = {
    GetScale() {return currentWidth * scaleWidthPercentReference},

    formatTextToMaxLineLength(text, spaces = "", maxLineLength = scaleWidthPercentReference) {
        if (!text || maxLineLength < 1) return text;

        const lines = [];
        let rest = text.trim();

        while (rest.length > maxLineLength) {
            // Try to break on ", ("
            let breakIndex = rest.lastIndexOf(", (", maxLineLength);

            if (breakIndex === -1) {
                // Try ", "
                breakIndex = rest.lastIndexOf(", ", maxLineLength);

                if (breakIndex === -1) {
                    // Try space
                    breakIndex = rest.lastIndexOf(" ", maxLineLength);
                } else {
                    breakIndex += 1;
                }
            } else {
                breakIndex += 1;
            }

            if (breakIndex === -1 || breakIndex === 0)
                breakIndex = maxLineLength;

            const line = rest.substring(0, breakIndex).trimEnd();
            lines.push(line);
            rest = rest.substring(breakIndex).trimStart();
        }

        if (rest.length > 0)
            lines.push(rest);

        return lines.join("\n" + spaces);
    },

    getDisplayDelimiter(length, delimiter) {
        return "*" + delimiter.repeat(length) + "*";
    },

    // Fully rewritten to replicate the C# logic
    getDisplayInDelimiter(text, delimiter = "-", spaces = "", displayChoice = 2) {
        const rawLines = text.split("\n").filter(Boolean);
        const rawLinesLength = rawLines.length - 1;

        // Wrap all raw lines first (just like C#)
        const wrapped = [];
        for (let index = 0; index < rawLinesLength; ++index) {
            //const block = this.formatTextToMaxLineLength(rawLines[index] + "\n-", "\n|", this.GetScale());
            const block = this.formatTextToMaxLineLength(rawLines[index] + "\n-", "", this.GetScale());
            wrapped.push(...block.split("\n"));
        }
        wrapped.push(...this.formatTextToMaxLineLength(rawLines[rawLinesLength], "", this.GetScale()).split("\n"));

        // After wrapping, compute correct max width
        const maxLineLength = Math.max(...wrapped.map(l => l.length), 0);
        const displayDelimiter = spaces + this.getDisplayDelimiter(maxLineLength, delimiter);
        const endLength = displayDelimiter.length - 1;

        // Build framed lines
        const framed = wrapped.map(l => {
            let s = spaces + "|" + l;
            const repeatSpace = l != "-" ? " " : l;
            let end = repeatSpace.repeat(Math.max(0, endLength - s.length)) + "|";
            s += end;
            return s;
        });

        let newText = "\n" + framed.join("\n") + "\n";

        switch (displayChoice) {
            case 0:
                return displayDelimiter + newText;
            case 1:
                return newText + displayDelimiter;
            default:
                return displayDelimiter + newText + displayDelimiter;
        }
    }
};

const materialsData = {
    Leather: { armorType: EArmorType.SuperLight, value: 50, defense: 0, weight: 0, description: "Leather that was probably made from a cow, horse, pig, or some other common farm animal." },
    FrosttailScales: { armorType: EArmorType.SuperLight, value: 60, defense: 0, weight: 0, description: "A pretty decent insulator, some people don’t like how it shines and reflects light, while others say it makes it fashionable." },
    GilledGoblinHide: { armorType: EArmorType.SuperLight, value: 70, defense: 0, weight: 0, description: "A flimsy hide with shapeshifting capabilities, offers regular defense for the super light armor-class." },
    BorealWindbackFeathers: { armorType: EArmorType.SuperLight, value: 90, defense: 0, weight: 0, description: "Stylish grey feathers with a touch of brown. They could be used to decorate your armor, protecting you from extreme cold, and increasing your CHA and NEG by 3. Can also be made into super light armor with the same effect by itself. Sometimes, unknown humanoid merchants sell these in bulk to shops, though no one knows how they are acquired..." },
    ShadowCloth: { armorType: EArmorType.SuperLight, value: 200, defense: 0, weight: 0, description: "A fine type of cloth that often peels off walls as a Shadow is starting to disappear after being killed. It starts to smolder and eventually burn when it's exposed to sunlight. Wearing any piece of equipment made from this will make it impossible to visually notice when standing in darkness..." },
    FairySkin: { armorType: EArmorType.SuperLight, value: 430, defense: 0, weight: 0, description: "Ever wanted to have armor that could cast spells on its own? Well now you can! Extremely taboo to the point some people will kill you on sight from just having it!" },
    NightmareWool: { armorType: EArmorType.SuperLight, value: 0, defense: 0, weight: 0, description: "Increases mana regen, EXTREMELY COLD." },
    Elbailer: { armorType: EArmorType.SuperLight, value: 1100, defense: 0, weight: 0, description: "The armor upgrades itself as you level up" },
    ReinforcedLeather: { armorType: EArmorType.Light, value: 75, defense: 0, weight: 0, description: "" },
    WolfFur: { armorType: EArmorType.Light, value: 110, defense: 0, weight: 0, description: "Can be used as inner coating for armor to add 25 defense onto it and make it more apt to exploration in cold areas..." },
    GluttonSkin: { armorType: EArmorType.Light, value: 130, defense: 1, weight: 0, description: "The skin of a corrupted humanoid, mixed in with the skin is little pieces of what look like stone… it’s probably better not think about it too much." },
    DwellerSkin: { armorType: EArmorType.Light, value: 130, defense: 0, weight: 0, description: "Orangish light and slightly heat-resistant material that increases your affinity with earth magic..." },
    UnnervingStraw: { armorType: EArmorType.Light, value: 130, defense: 0, weight: 0, description: "scarecrows drop" },
    AlphaWolfFur: { armorType: EArmorType.Light, value: 150, defense: 0, weight: 0, description: "Can be used as inner coating for armor to add 35 defense onto it..." },
    LaceratorScales: { armorType: EArmorType.Light, value: 0, defense: 1, weight: 0, description: "25% ice res" },
    ElementalCloth: { armorType: EArmorType.Light, value: 0, defense: 0, weight: 0, description: "Cloth that was dipped in water infused with mana..." },
    WyrmLeather: { armorType: EArmorType.Light, value: 0, defense: 2, weight: 0, description: "" },
    LivingWood: { armorType: EArmorType.Light, value: 2000, defense: -2, weight: 0, description: "It’s still alive…It can bleed, talk, think, suffer, and see..." },
    DragonLeather: { armorType: EArmorType.Light, value: 0, defense: 3, weight: 0, description: "" },
    ScrapMetal: { armorType: EArmorType.Light, value: 25, defense: -3, weight: 0, description: "" },
    Iron: { armorType: EArmorType.Normal, value: 50, defense: 0, weight: 0, description: "" },
    Copper: { armorType: EArmorType.Normal, value: 250, defense: 0, weight: 0, description: "Copper is slightly lighter than iron..." },
    Steel: { armorType: EArmorType.Normal, value: 250, defense: 1, weight: 2, description: "" },
    Bronze: { armorType: EArmorType.Normal, value: 500, defense: 1, weight: 0, description: "" },
    DemidragonScales: { armorType: EArmorType.Normal, value: 725, defense: 1, weight: 2, description: "25% resistance to the demidragon’s main element." },
    Gold: { armorType: EArmorType.Normal, value: 750, defense: -2, weight: 0, description: "Gives 25% resistance to all elements when worn." },
    AcidflyLarvaeShell: { armorType: EArmorType.Heavy, value: 160, defense: 0, weight: 0, description: "It can be crushed (requiring 20 CRA and 32 STR)..." },
    Chrome: { armorType: EArmorType.Heavy, value: 625, defense: 2, weight: 3, description: "" },
    WyrmScales: { armorType: EArmorType.Heavy, value: 0, defense: 0, weight: 0, description: "" },
    DragonScales: { armorType: EArmorType.Heavy, value: 0, defense: 0, weight: 0, description: "" },
    UntreatedAcidscales: { armorType: EArmorType.SuperHeavy, value: 40, defense: -2, weight: 6, description: "Heavy and thick dark scales that can be harvested from dead Male Acidflies..." },
    DwellerScales: { armorType: EArmorType.SuperHeavy, value: 80, defense: 0, weight: 0, description: "Extremely thick orangish scales..." },
    TreatedAcidscales: { armorType: EArmorType.SuperHeavy, value: 90, defense: 0, weight: 0, description: "Bourgogne scales. Armor made from these will be acidproof..." },
    BorealWindbackCarapace: { armorType: EArmorType.SuperHeavy, value: 480, defense: 1, weight: 0, description: "When melted, this stone can be molded back into super heavy armor..." },
    Titanium: { armorType: EArmorType.SuperHeavy, value: 1100, defense: 1, weight: 3, description: "" },
    AbyssalSteel: { armorType: EArmorType.SuperHeavy, value: 2000, defense: 2, weight: 10, description: "" },
    DragonBones: { armorType: EArmorType.SuperHeavy, value: 5000, defense: 3, weight: 5, description: "" }
};

class Material {
    constructor(name, category, amount = 1, value = 0) {
        this.name = name;
        this.category = category;
        this.amount = amount;
        this._value = value;
    }
    get Value() { return this._value * this.amount; }
    toString() { return `(${this.name}, ${this.amount})`; }
    getProperty(property) {
        switch (property) {
            case "Defense": return null;
            case "Weight": return null;
            default: return null;
        }
    }
}

class ArmorMaterial extends Material {
    constructor(materialName, amount = 1) {
        const data = materialsData[materialName];
        super(materialName, "Armor", amount, data?.value ?? 0);
        this.armorType = data?.armorType ?? EArmorType.Normal;
        this._defense = data?.defense ?? 0;
        this._weight = data?.weight ?? 0;
        this.description = data?.description ?? "";
    }
    get Defense() { return this._defense * this.amount; }
    get Weight() { return this._weight * this.amount; }
    getDescriptionDisplay() {
        const spaces = "\n" + " ".repeat(this.name.length + 1);
        let disp = `${this.name}`;
        disp += `${spaces}Value: ${this._value}`;
        disp += `${spaces}Defense: ${this._defense}`;
        disp += `${spaces}Weight: ${this._weight}`;
        if (this.description) disp += `${spaces}Description: ${this.description}`;
        return disp;
    }

    static getMaterials() {
        const result = {};
        for (const [key, val] of Object.entries(materialsData)) {
            if (!result[val.armorType]) result[val.armorType] = [];
            result[val.armorType].push(key);
        }
        return result;
    }

    static getMaterial(materialName) {
        const data = materialsData[materialName];
        if (!data) return null;
        return { [data.armorType]: (new ArmorMaterial(materialName, 1)).getDescriptionDisplay() };
    }

    static tryCreateMaterial(materialName, amount = 1) {
        const normalized = Object.keys(materialsData).find(k => k.toLowerCase() === materialName.toLowerCase());
        if (!normalized) return null;
        return new ArmorMaterial(normalized, amount);
    }

    static calculSumMaterial(armorLocation, crafterLevel, baseDefense, baseWeight, materialsInstances = []) {
        if (!materialsInstances || materialsInstances.length === 0) {
            const data = { Value: 0, Defense: baseDefense * crafterLevel, Weight: baseWeight * crafterLevel };
            return { ok: false, data };
        }

        let sumDefense = 0;
        let sumWeight = 0;
        let totalCount = materialsInstances.reduce((s, m) => s + m.amount, 0);

        for (const m of materialsInstances) {
            sumDefense += (m.Defense ?? 0);
            sumWeight += (m.Weight ?? 0);
        }

        if (armorLocation === EArmorLocation.Shield) {
            sumDefense *= 2;
        }

        sumDefense = (sumDefense / totalCount) + baseDefense;
        sumDefense *= crafterLevel;
        sumDefense = Math.round(sumDefense * 100) / 100;
        sumWeight += baseWeight;
        sumWeight *= crafterLevel;

        return {
            ok: true,
            data: { Defense: sumDefense, Weight: sumWeight, Value: 0 }
        };
    }
}
// (END existing code)

function isNotLocal() {
  const hostname = window.location.hostname;
  // Check for common local hostnames and IP addresses
  const localIdentifiers = [
    'localhost',
    '127.0.0.1',
    '[::1]' // IPv6 localhost address
  ];

  // If the hostname is not found in the localIdentifiers array, it's likely not local
  return !localIdentifiers.includes(hostname);
}


/* ---------- UI & Console-parsing logic (new) ---------- */

const materialsContainer = document.getElementById("materials");
const detailText = document.getElementById("detailText");
const instanceInfo = document.getElementById("instanceInfo");
const amountInput = document.getElementById("amount");
const createBtn = document.getElementById("create");
const search = document.getElementById("search");
const searches = {Name: "", Type: ""};

const commandInput = document.getElementById("commandInput");
const runCommandBtn = document.getElementById("runCommand");
const outputArea = document.getElementById("outputArea");
const selectedList = document.getElementById("selectedList");
const removeAllBtn = document.getElementById("removeAll");
const clearOutputBtn = document.getElementById("clearOutput");

let selectedMaterialName = null;
let createdInstances = [];
const filterControls = document.getElementById("filterControls");
let selectedFilterModeValue = filterControls.querySelector('input[name="filterBy"]:checked').value;
const searchControls = document.getElementById("searchLogicControls");
let selectedSearchModeValue = searchControls.querySelector('input[name="searchLogic"]:checked').value;


function renderMaterialsAND(filters) {
    const groups = ArmorMaterial.getMaterials();
    let armorTypes = Object.values(EArmorType);
    const nameFilter = filters["Name"];
    const typeFilter = filters["Type"];

    if (typeFilter) {
        armorTypes = armorTypes.filter(e => e.includes(typeFilter));
    }

    for (const type of armorTypes) {
        if (!groups[type]) continue;
        const groupDiv = document.createElement("div");
        groupDiv.className = "group";
        const h = document.createElement("h3");
        h.textContent = type;
        groupDiv.appendChild(h);

        groups[type].sort().forEach(name => {
            if (nameFilter && !name.toLowerCase().includes(nameFilter)) return;
            const item = document.createElement("div");
            item.className = "materialItem";
            item.textContent = name;
            item.onclick = () => {
                lastBtnRefresh = item;
                showDetail(name);
            };
            groupDiv.appendChild(item);
        });

        if (groupDiv.childElementCount > 1) {
            materialsContainer.appendChild(groupDiv);
        } else {
            groupDiv.remove();
        }
    }
}

function renderMaterialsOR(filters) {
    const groups = ArmorMaterial.getMaterials();
    const armorTypes = Object.values(EArmorType);
    const nameFilter = filters["Name"];
    const typeFilter = filters["Type"];

    for (const type of armorTypes) {
        if (!groups[type]) continue;
        const groupDiv = document.createElement("div");
        groupDiv.className = "group";
        const h = document.createElement("h3");
        h.textContent = type;
        groupDiv.appendChild(h);
        const isType = type.includes(typeFilter);

        groups[type].sort().forEach(name => {
            if ((!isType && !nameFilter) || !name.toLowerCase().includes(nameFilter)) return;
            const item = document.createElement("div");
            item.className = "materialItem";
            item.textContent = name;
            item.onclick = () => {
                lastBtnRefresh = item;
                showDetail(name);
            };
            groupDiv.appendChild(item);
        });

        if (groupDiv.childElementCount > 1) {
            materialsContainer.appendChild(groupDiv);
        } else {
            groupDiv.remove();
        }
    }
}

function renderMaterials() {
    materialsContainer.innerHTML = "";
    const filters = {};

    if (selectedSearchModeValue == "Current") {
        filters[selectedFilterModeValue] = searches[selectedFilterModeValue].toLowerCase();
        renderMaterialsAND(filters);
    } else {
        for (const key in searches) {
            filters[key] = searches[key].toLowerCase();
        }

        if (selectedSearchModeValue == "AND") {
            renderMaterialsAND(filters);
        } else {
            renderMaterialsOR(filters);
        }
    }
}

function showDetail(name) {
    selectedMaterialName = name;
    const display = ArmorMaterial.getMaterial(name);
    if (!display) {
        detailText.textContent = "Material not found";
        return;
    }
    const armorType = Object.keys(display)[0];
    const text = display[armorType];
    detailText.textContent = Reuse.getDisplayInDelimiter(text, '-', "");
    instanceInfo.textContent = "";

    window.scrollTo({
        top: 0,
        behavior: 'smooth' // Optional: for a smooth scrolling animation
    });
}

createBtn.addEventListener("click", () => {
    if (!selectedMaterialName) return alert("Select a material first.");
    const amount = Math.max(1, parseInt(amountInput.value || "1", 10));
    const instance = ArmorMaterial.tryCreateMaterial(selectedMaterialName, amount);
    if (!instance) return alert("Cannot create instance.");
    createdInstances.push(instance);
    updateSelectedList();
});

search.addEventListener("input", (e) => {
    searches[selectedFilterModeValue] = e.target.value;
    renderMaterials();
});

function removeInstance(index) {
    if (index >= 0 && index < createdInstances.length) {
        createdInstances.splice(index, 1);
        updateSelectedList();
    }
}

function updateInstanceAmount(index, newAmount) {
    if (index >= 0 && index < createdInstances.length) {
        const amount = Math.max(0, parseInt(newAmount, 10) || 0); // Ensure amount is non-negative integer
        if (amount === 0) {
            removeInstance(index);
        } else {
            // Update the amount and recalculate defense/weight properties (which are getters)
            createdInstances[index].amount = amount;
            updateSelectedList();
        }
    }
}

function updateSelectedList() {
    const listContainer = document.getElementById("selectedList");
    listContainer.innerHTML = ""; // Clear existing content

    if (createdInstances.length === 0) {
        const noneText = document.createElement("span");
        noneText.textContent = "(none)";
        listContainer.appendChild(noneText);
        return;
    }

    createdInstances.forEach((instance, index) => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "selected-instance-item";

        // Material Name and Stats
        const infoSpan = document.createElement("span");
        infoSpan.textContent = `${instance.name} — Def:${instance.Defense} W:${instance.Weight}`;
        infoSpan.style.flexGrow = "1";
        itemDiv.appendChild(infoSpan);

        // Quantity Input
        const amountInput = document.createElement("input");
        amountInput.type = "number";
        amountInput.min = "0";
        amountInput.value = instance.amount;
        amountInput.style.width = "40px";
        amountInput.onchange = (e) => updateInstanceAmount(index, e.target.value);
        itemDiv.appendChild(amountInput);

        // Remove Button
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";
        removeBtn.style.fontSize = "12px";
        removeBtn.style.padding = "2px 5px";
        removeBtn.onclick = () => removeInstance(index);
        itemDiv.appendChild(removeBtn);

        listContainer.appendChild(itemDiv);
    });
}

removeAllBtn.addEventListener("click", () => {
    createdInstances = [];
    updateSelectedList();
});

/* ---------- Console / command parsing ---------- */

function writeOutput(text, framed = true) {
    if (framed) {
        outputArea.textContent = Reuse.getDisplayInDelimiter(text, '-', "");
    } else {
        outputArea.textContent = text;
    }
}

function showUsage() {
    const lines = [
        "Usage: <Armor> <CrafterLevel> [<Material1> [<Quantity1>] ... ]",
        "Example: Mid 2 Steel 2 Iron",
        "You can also use commands: armors, materials, usage, clear"
    ];
    writeOutput(lines.join("\n"), true);
}

function showMaterialsList() {
    const groups = ArmorMaterial.getMaterials();
    const lines = ["Materials by ArmorType:"];
    for (const type of Object.keys(groups)) {
        lines.push(`${type}: ${groups[type].join(", ")}`);
    }
    writeOutput(lines.join("\n"), true);
}

// helper to parse token pairs into material instances
function parseMaterialsFromTokens(tokens, armorLocation = null) {
    let sum = 0;
    let amountDistribute = 0;
    const length = tokens.length;
    const dictio = {};

    for (let i = 0; i < length; ++i) {
        const value = parseInt(tokens[i], 10);

        if (Number.isNaN(value) && (i + 1 >= length || Number.isNaN(parseInt(tokens[i + 1], 10)))) {
            if (!(dictio[tokens[i]] && "dist" in dictio[tokens[i]])) {
                dictio[tokens[i]] = {dist:true, ...dictio[tokens[i]]};
                ++amountDistribute;
            }

            continue;
        } else if (i - 1 >= 0 && Number.isNaN(parseInt(tokens[i - 1], 10))) {
            if (dictio[tokens[i - 1]] && "value" in dictio[tokens[i - 1]]) {
                dictio[tokens[i - 1]]["value"] += value;
            } else {
                dictio[tokens[i - 1]] = {value:value, ...dictio[tokens[i - 1]]};
            }

            sum += value;
        }
    }
    const materials = Object.keys(dictio)
    const requiredQty = craftingQTYData[armorLocation] - ;
    const remain = requiredQty - sum;
    let distribute = remain / amountDistribute;
    const isOdd = distribute % 1 != 0;

    if (isOdd) {
        distribute -= distribute % 1;
    }

    distribute = Math.trunc(distribute);
    
    // tokens is array of remaining tokens (strings)
    const instances = [];

    materials.forEach(name => {
        const material = dictio[name];
        let qty = 0;

        if ("value" in material) {
            qty += material.value;
        }

        const distributed = "dist" in material;
        if (distributed) {
            qty += distribute;
        }

        const inst = ArmorMaterial.tryCreateMaterial(name, qty);
        if (inst) instances.push(inst);
        else {
            instances.push({ name, amount: qty, distributed: distributed, _notFound: true });
        }
    });

    if (isOdd) {
        const firstDistributeIndex = instances.findLastIndex(e => e.distributed);
        if (firstDistributeIndex >= 0)
            ++instances[firstDistributeIndex];
    }

    return instances;
}

function formatInstancesForDisplay(instances) {
    if (!instances || instances.length === 0) return "(none)";
    return instances.map(i => i._notFound ? `(${i.name}, ${i.amount}) [NOT FOUND]` : `${i.toString()} — Def:${i.Defense} W:${i.Weight}`).join("\n");
}

function runCommand(input) {
    const raw = (input || "").trim();
    if (!raw) return;

    const lower = raw.toLowerCase();
    if (lower === "clear") {
        outputArea.textContent = "";
        return;
    }
    if (lower === "materials") {
        showMaterialsList();
        return;
    }
    if (lower === "usage") {
        showUsage();
        return;
    }
    if (lower === "armors") {
        // We don't have a full Armor dataset here; show armor types and examples
        writeOutput("Armor Types: SuperLight, Light, Normal, Heavy, SuperHeavy\nUse <ArmorName> <CrafterLevel> <Materials...>", true);
        return;
    }

    // Parse the creation syntax: <Armor> <CrafterLevel> [<Material1> [<Quantity1>] ...]
    const tokens = raw.split(/\s+/);

    if (tokens.length >= 2) {
        const armorName = tokens[0];
        const crafterStr = tokens[1];
        const rest = tokens.slice(2);

        if (!/^\d+$/.test(crafterStr)) {
            writeOutput(`Bad syntax: second token must be CrafterLevel (integer). Got '${crafterStr}'`, true);
            return;
        }
        const crafterLevel = parseInt(crafterStr, 10);
        const armor = EArmor[armorName.toLowerCase()];

        if (!armor) {
            writeOutput("Armor was not found:\n" + armorName, true);
            return;
        }

        const parsedInstances = parseMaterialsFromTokens(rest, armor.loc);
        updateSelectedList();

        // collect not found
        const notFound = parsedInstances.filter(i => i._notFound);
        if (notFound.length > 0) {
            writeOutput("Some materials were not found:\n" + notFound.map(n => `${n.name} (qty ${n.amount})`).join("\n"), true);
            return;
        }

        // save parsed instances into createdInstances (append) so the UI basket reflects the command
        createdInstances = createdInstances.concat(parsedInstances);

        const totalQty = createdInstances.reduce((accumulator, instance) => {
            return accumulator + instance.amount;
        }, 0);

        if (totalQty != craftingQTYData[armor.loc]) {
            writeOutput(`Required '${craftingQTYData[armor.loc]}' materials. Got: ${totalQty}`, true);
            return;
        }

        const baseDefense = 0;
        const baseWeight = 0;

        const res = ArmorMaterial.calculSumMaterial(armor.loc, crafterLevel, baseDefense, baseWeight, createdInstances);

        // Build display: show the creation line, the instances, and calculation
        const outLines = [];
        outLines.push(`Command: ${raw}`);
        outLines.push(`Armor: ${armor.name} | CrafterLevel: ${crafterLevel} | Location: ${armor.loc}`);
        outLines.push("");
        outLines.push("Materials used:");
        outLines.push(formatInstancesForDisplay(createdInstances));
        outLines.push("");
        if (res.ok) {
            outLines.push(`Result: Defense=${res.data.Defense} | Weight=${res.data.Weight}`);
        } else {
            outLines.push(`Result: (no materials) Defense=${res.data.Defense} | Weight=${res.data.Weight}`);
        }

        writeOutput(outLines.join("\n"), true);
        return;
    }

    // fallback: try to parse as single material name
    const maybeMaterial = ArmorMaterial.tryCreateMaterial(raw, 1);
    if (maybeMaterial) {
        createdInstances.push(maybeMaterial);
        updateSelectedList();
        writeOutput(`Added material ${maybeMaterial.toString()}`, true);
        return;
    }

    writeOutput(`Command not recognized: ${raw}`, true);
}

/* ---------- wire buttons ---------- */

runCommandBtn.addEventListener("click", () => {
    runCommand(commandInput.value);
    commandInput.value = "";
});

commandInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        runCommand(commandInput.value);
        commandInput.value = "";
    }
});

clearOutputBtn.addEventListener("click", () => {
    outputArea.textContent = "";
});

filterControls.addEventListener('change', (e) => {
    if (e.target.name === 'filterBy') {
        searches[selectedFilterModeValue] = search.value;
        selectedFilterModeValue = e.target.value;
        search.value = searches[selectedFilterModeValue] ?? "";
        renderMaterials();
    }
});

searchControls.addEventListener('change', (e) => {
    if (e.target.name === 'searchLogic') {
        selectedSearchModeValue = e.target.value;
        renderMaterials();
    }
});

function updatePageWidth() {
    // window.innerWidth returns the width of the viewport in pixels
    currentWidth = window.innerWidth;

    if (lastBtnRefresh) {
        const previousTop = window.scrollY;
        lastBtnRefresh.onclick();
        window.scrollTo({
            top: previousTop,
            behavior: 'smooth' // Optional: for a smooth scrolling animation
        });
    }

    writeOutput("Welcome — type 'usage' to see syntax or try: Mid 2 Steel 2 Iron", true);
}

/* ---------- initialize ---------- */
function initializeGet() {
    const GetLength = window.location.search.length;
    const currentGets = {};

    if (GetLength > 1) {
        const currentGetURL = window.location.search.substring(1, GetLength);
        currentGetURL.split("&").forEach(e => {
            const data = e.split("=");
            currentGets[data[0].toLowerCase()] = data[1];
        });

        if ("searchlogic" in currentGets) {
            const newSelectedSearchMode = searchControls.querySelector(`input[name="searchLogic"][value="${currentGets["searchlogic"].toUpperCase()}"]`);

            if (newSelectedSearchMode) {
                newSelectedSearchMode.checked = true;
            }
        }

        if ("name" in currentGets)
            searches.Name = currentGets["name"];
        if ("type" in currentGets)
            searches.Type = currentGets["type"];

        search.value = searches[selectedFilterModeValue];

        if ("detail" in currentGets) {
            const materials = materialsContainer.querySelectorAll('div[class="materialItem"]');
            const detail = currentGets['detail'].toLowerCase();
            for (const material of materials) {
                if (material.textContent.toLowerCase() == detail) {
                    material.click();
                    break;
                }
            }
        }

        if ("console" in currentGets) {
            runCommand(currentGets['console'].split("-").join(" "));
        }
    }
}


window.onload = async function () {
    window.addEventListener('resize', updatePageWidth);
    updatePageWidth();
    initializeGet();

    if (isNotLocal()) 
        history.pushState("", "NazaraxCraft", "../Nazarax/Craft/" + window.location.search);

    renderMaterials();
    updateSelectedList();
}