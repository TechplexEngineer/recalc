import Heading from "common/components/calc-heading/Heading";
import MaterialInput from "common/components/io/inputs/MaterialInput";
import MultiInputLine from "common/components/io/inputs/MultiInputLine";
import { LabeledNumberInput } from "common/components/io/inputs/NumberInput";
import PressureAngleInput from "common/components/io/inputs/PressureAngleInput";
import { LabeledQtyInput } from "common/components/io/inputs/QtyInput";
import { LabeledNumberOutput } from "common/components/io/outputs/NumberOutput";
import { LabeledQtyOutput } from "common/components/io/outputs/QtyOutput";
import Material from "common/models/Material";
import Measurement from "common/models/Measurement";
import {
  QueryableParamHolder,
  queryStringToDefaults,
  stateToQueryString,
} from "common/tooling/query-strings";
import { setTitle } from "common/tooling/routing";
import { defaultAssignment } from "common/tooling/versions";
import React, { useEffect, useState } from "react";
import { NumberParam, StringParam } from "use-query-params";

import load from "./index";
import { calculateStateForPlanetary } from "./math";

function calculateFOS(safeLoad, stallLoad) {
  if (stallLoad.scalar === 0) {
    return 0;
  }

  return safeLoad.div(stallLoad).scalar;
}

export default function Planetary() {
  setTitle(load.title);

  const {
    mode: mode_,
    inputTorque: inputTorque_,
    numPlanetaries: numPlanetaries_,
    diametralPitch: diametralPitch_,
    pressureAngle: pressureAngle_,
    pinionTeeth: pinionTeeth_,
    gearTeeth: gearTeeth_,
    pinionWidth: pinionWidth_,
    gearWidth: gearWidth_,
    pinionMaterial: pinionMaterial_,
    gearMaterial: gearMaterial_,
  } = queryStringToDefaults(
    window.location.search,
    {
      mode: StringParam,
      inputTorque: Measurement.getParam(),
      numPlanetaries: NumberParam,
      diametralPitch: Measurement.getParam(),
      pressureAngle: StringParam,
      pinionTeeth: NumberParam,
      gearTeeth: NumberParam,
      pinionWidth: Measurement.getParam(),
      gearWidth: Measurement.getParam(),
      pinionMaterial: Material.getParam(),
      gearMaterial: Material.getParam(),
    },
    load.initialState,
    defaultAssignment
  );

  // Inputs
  const [mode, setMode] = useState(mode_);
  const [inputTorque, setInputTorque] = useState(inputTorque_);
  const [numPlanetaries, setNumPlanetaries] = useState(numPlanetaries_);
  const [diametralPitch, setDiametralPitch] = useState(diametralPitch_);
  const [pressureAngle, setPressureAngle] = useState(pressureAngle_);
  const [pressureAngleMeas, setPressureAngleMeas] = useState(
    new Measurement(parseFloat(pressureAngle.slice(0, -1)), "deg")
  );
  const [pinionTeeth, setPinionTeeth] = useState(pinionTeeth_);
  const [pinionMaterial, setPinionMaterial] = useState(pinionMaterial_);
  const [pinionWidth, setPinionWidth] = useState(pinionWidth_);
  const [gearTeeth, setGearTeeth] = useState(gearTeeth_);
  const [gearMaterial, setGearMaterial] = useState(gearMaterial_);
  const [gearWidth, setGearWidth] = useState(gearWidth_);

  // Outputs
  const [pinionSafeLoad, setPinionSafeLoad] = useState(
    new Measurement(1, "lbf")
  );
  const [pinionStallLoad, setPinionStallLoad] = useState(
    new Measurement(1, "lbf")
  );
  const [pinionFOS, setPinionFOS] = useState(
    calculateFOS(pinionSafeLoad, pinionStallLoad)
  );
  const [gearSafeLoad, setGearSafeLoad] = useState(new Measurement(1, "lbf"));
  const [gearStallLoad, setGearStallLoad] = useState(new Measurement(1, "lbf"));
  const [gearFOS, setGearFOS] = useState(
    calculateFOS(gearSafeLoad, gearStallLoad)
  );

  useEffect(() => {
    const state = calculateStateForPlanetary(
      inputTorque,
      numPlanetaries,
      diametralPitch,
      pressureAngleMeas,
      pinionTeeth,
      pinionMaterial,
      gearTeeth,
      gearMaterial,
      pinionWidth,
      gearWidth
    );

    setPinionSafeLoad(state.pinion.safeLoad);
    setPinionStallLoad(state.pinion.stallForce);
    setGearSafeLoad(state.gear.safeLoad);
    setGearStallLoad(state.gear.stallForce);
  }, [
    inputTorque,
    numPlanetaries,
    diametralPitch,
    pressureAngle,
    pinionTeeth,
    pinionMaterial,
    gearTeeth,
    gearMaterial,
    pinionWidth,
    gearWidth,
  ]);

  useEffect(() => {
    setPressureAngleMeas(
      new Measurement(parseFloat(pressureAngle.slice(0, -1)), "deg")
    );
  }, [pressureAngle]);

  useEffect(() => {
    setPinionFOS(calculateFOS(pinionSafeLoad, pinionStallLoad));
  }, [pinionStallLoad, pinionSafeLoad]);
  useEffect(() => {
    setGearFOS(calculateFOS(gearSafeLoad, gearStallLoad));
  }, [gearStallLoad, gearSafeLoad]);

  return (
    <>
      <Heading
        title={load.title}
        subtitle={`V${load.version}`}
        getQuery={() => {
          return stateToQueryString([
            new QueryableParamHolder({ version: load.version }, NumberParam),
          ]);
        }}
      />
      <div className="columns">
        <div className="column">
          <LabeledQtyInput
            inputId="inputTorque"
            stateHook={[inputTorque, setInputTorque]}
            label="Input Torque"
            choices={["N m", "lbf in", "lbf ft"]}
          />
          <LabeledNumberInput
            label="# Inputs"
            stateHook={[numPlanetaries, setNumPlanetaries]}
          />
          <LabeledQtyInput
            inputId="diametralPitch"
            stateHook={[diametralPitch, setDiametralPitch]}
            label="Diametral Pitch"
            choices={["1/in"]}
          />
          <PressureAngleInput stateHook={[pressureAngle, setPressureAngle]} />
          <MultiInputLine label="Pinion(s)">
            <LabeledNumberInput
              inputId="pinionTeeth"
              stateHook={[pinionTeeth, setPinionTeeth]}
              label="Teeth"
            />
            <MaterialInput
              label="Material"
              stateHook={[pinionMaterial, setPinionMaterial]}
            />
            <LabeledQtyInput
              stateHook={[pinionWidth, setPinionWidth]}
              choices={["in"]}
              label="Width"
            />
          </MultiInputLine>
          <MultiInputLine label="Driven Gear">
            <LabeledNumberInput
              inputId="gearTeeth"
              stateHook={[gearTeeth, setGearTeeth]}
              label="Teeth"
            />
            <MaterialInput
              label="Material"
              stateHook={[gearMaterial, setGearMaterial]}
            />
            <LabeledQtyInput
              stateHook={[gearWidth, setGearWidth]}
              choices={["in"]}
              label="Width"
            />
          </MultiInputLine>
          <LabeledQtyOutput
            stateHook={[pinionSafeLoad, setPinionSafeLoad]}
            choices={["lbf", "N"]}
            label={"Pinion Safe Load"}
            precision={3}
          />
          <LabeledQtyOutput
            stateHook={[pinionStallLoad, setPinionStallLoad]}
            choices={["lbf", "N"]}
            label={"Pinion Stall Load"}
            precision={3}
          />
          <LabeledNumberOutput
            stateHook={[pinionFOS, setPinionFOS]}
            label="Pinion Factor of Safety"
            precision={3}
          />
          <LabeledQtyOutput
            stateHook={[gearSafeLoad, setGearSafeLoad]}
            choices={["lbf", "N"]}
            label={"Driven Gear Safe Load"}
            precision={3}
          />
          <LabeledQtyOutput
            stateHook={[gearStallLoad, setGearStallLoad]}
            choices={["lbf", "N"]}
            label={"Driven Gear Stall Load"}
            precision={3}
          />
          <LabeledNumberOutput
            stateHook={[gearFOS, setGearFOS]}
            label="Driven Gear Factor of Safety"
            precision={3}
          />
        </div>
        <div className="column">
          <article className="message is-warning">
            <div className="message-header">
              <p>Warning</p>
            </div>
            <div className="message-body">
              This calculator uses some questionable regression math in order to
              estimate Lewis Y factors. Please take results from this calculator
              with a grain of salt. This math is not perfect, it exists just for
              estimating factors of safety.
              <br />
              <br />
              This calculator assumes the pinion is attached directly to the
              motor output shaft, and that each motor has a pinion together
              driving a single gear.
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
