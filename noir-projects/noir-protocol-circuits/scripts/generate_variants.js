const TOML = require("@iarna/toml");
const fs = require("fs");
const path = require("path");
const config = require("../private_kernel_reset_config.json");

const root = path.join(__dirname, "../");
const sourceFolder = "private-kernel-reset";
const sourceSimulatedFolder = "private-kernel-reset-simulated";
const autogeneratedCircuitsFolder = "crates/autogenerated";

const dimensionNames = Object.keys(config.dimensions);

const aliases = {
  tiny: [4, 4, 4, 4, 4, 4, 4, 4, 4],
  full: [64, 64, 64, 64, 64, 64, 64, 64, 32],
};

function getResetTag(dimensions) {
  return dimensions.join("_");
}

function areValidDimensions(dimensions) {
  return (
    dimensions.length === dimensionNames.length &&
    dimensions.every((v) => typeof v === "number")
  );
}

function isFullDimensions(dimensions) {
  return dimensions.every((v, i) => v === aliases.full[i]);
}

function getDimensionsList(allowedVariants) {
  if (allowedVariants.length) {
    // allowedVariant can be a key in aliases, or a tag.
    return allowedVariants
      .map((name) => aliases[name] || allowedVariants.split("_").map((v) => +v))
      .filter(areValidDimensions);
  }

  // Variants.
  const dimensionsList = dimensionNames.reduce(
    (acc, name) =>
      acc.flatMap((combination) =>
        config.dimensions[name].variants.map((v) => [...combination, v]),
      ),
    [[]],
  );

  // Standalone.
  dimensionNames.forEach((name, i) => {
    config.dimensions[name].standalone.forEach((val) => {
      const dimensions = Array(dimensionNames.length).fill(0);
      dimensions[i] = val;
      dimensionsList.push(dimensions);
    });
  });

  // Special cases.
  config.specialCases.forEach((dimensions) => dimensionsList.push(dimensions));

  return dimensionsList;
}

function generateDimensions(dimensionsList) {
  const dimensionValuesStrings = dimensionsList.map(
    (dimensions) => `  [${dimensions.join(", ")}]`,
  );

  const fileContent = ["[", dimensionValuesStrings.join(",\n"), "]"].join("\n");

  fs.writeFileSync(
    path.join(root, "private_kernel_reset_dimensions.json"),
    fileContent,
  );
}

function generateCircuits(dimensionsList, nargoToml, isSimulated) {
  const originalFolder = !isSimulated ? sourceFolder : sourceSimulatedFolder;
  const originalCratePath = path.join(root, "crates", originalFolder);
  const originalNargoToml = TOML.parse(
    fs.readFileSync(path.join(originalCratePath, "Nargo.toml"), "utf8"),
  );
  const originalName = originalNargoToml.package.name;

  for (const dimensions of dimensionsList) {
    // The default private-kernel-reset(-simulated) has full dimensions.
    if (isFullDimensions(dimensions)) {
      continue;
    }

    const variantNargoToml = structuredClone(originalNargoToml);

    const tag = getResetTag(dimensions);
    variantNargoToml.package.name = `${originalName}_${tag}`;

    for ([depName, depDescriptor] of Object.entries(
      variantNargoToml.dependencies,
    )) {
      if (depDescriptor.path) {
        depDescriptor.path = "../" + depDescriptor.path;
      }
    }

    let mainDotNoirCode = fs.readFileSync(
      path.join(originalCratePath, "src/main.nr"),
      "utf8",
    );

    for (let i = 0; i < dimensions.length; i++) {
      const value = dimensions[i];
      const name = dimensionNames[i];
      const regex = new RegExp(`^global\\s+${name}:\\su32\\s=\\s(.*);.*$`, "m");
      if (!mainDotNoirCode.match(regex)) {
        throw new Error(`Could not find dimension ${name} in main.nr`);
      }
      // Update value.
      mainDotNoirCode = mainDotNoirCode.replace(
        regex,
        `global ${name}: u32 = ${value};`,
      );
      // Remove constants.
      mainDotNoirCode = mainDotNoirCode.replace(
        /use dep::types::\{\s*constants::\{[^}]*?\},\s*([^}]*?)\};/,
        (_, rest) => {
          const restVars = rest
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item.length > 0);

          return restVars.length > 1
            ? `use dep::types::{${restVars.join(", ")}};`
            : restVars.length === 1
              ? `use dep::types::${restVars[0]};`
              : "";
        },
      );
    }

    const variantFolder = path.join(
      autogeneratedCircuitsFolder,
      `${originalFolder}-${tag}`,
    );

    fs.mkdirSync(path.join(variantFolder, "src"), {
      recursive: true,
    });

    fs.writeFileSync(path.join(variantFolder, "src/main.nr"), mainDotNoirCode);

    fs.writeFileSync(
      path.join(variantFolder, "Nargo.toml"),
      TOML.stringify(variantNargoToml),
    );

    nargoToml.workspace.members.push(variantFolder);
  }
}

function main() {
  const allowedVariants = process.argv.slice(2) || [];

  const nargoToml = TOML.parse(
    fs.readFileSync("./Nargo.template.toml", "utf8"),
  );

  const dimensionsList = getDimensionsList(allowedVariants);

  const autogeneratedCircuitsPath = path.join(
    root,
    autogeneratedCircuitsFolder,
  );
  if (fs.existsSync(autogeneratedCircuitsPath)) {
    fs.rmSync(autogeneratedCircuitsPath, { recursive: true, maxRetries: 3 });
  }
  fs.mkdirSync(autogeneratedCircuitsPath);

  generateDimensions(dimensionsList);
  generateCircuits(dimensionsList, nargoToml, false);
  generateCircuits(dimensionsList, nargoToml, true);

  const content = [
    "# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.",
    TOML.stringify(nargoToml),
  ].join("\n");

  fs.writeFileSync("./Nargo.toml", content);
}

main();
