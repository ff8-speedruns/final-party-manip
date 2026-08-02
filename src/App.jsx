import { useCallback, useMemo, useState } from "react";
import { Accordion, Anchor, Badge, Center, Code, Grid, List, MultiSelect, Select, Stack, Switch, Text, TextInput } from "@mantine/core";
import { DPad, ToolShell } from "@ff8-speedruns/ui";
import { CHARACTERS, GAME_VERSIONS, HOLY_WAR_PARTY, MOVEMENTS_SIZE, createManip } from "./lib/manip";
import { CHARACTER_LABELS } from "./lib/display";
import Results from "./components/Results";

const TILT_FOR_DIRECTION = { up: "w", down: "s", left: "a", right: "d", wild: "*" };

// Rinoa is excluded by default. She's the slowest of the six, so most
// runners aren't targeting a party that includes her. Also it's all her fault.
const DEFAULT_CHARACTERS = CHARACTERS.filter((name) => name !== "rinoa");

export default function App() {
    const [version, setVersion] = useState("PC");
    const [tilts, setTilts] = useState("");
    const [checkedCharacters, setCheckedCharacters] = useState(DEFAULT_CHARACTERS);

    // Holy War is just a preset button. Its own on/off state is derived
    // from whether the current selection happens to match the Holy War 
    // party exactly, so it stays correct even if you get there by 
    // hand-picking checkboxes instead.
    const isHolyWar = checkedCharacters.length === HOLY_WAR_PARTY.length && HOLY_WAR_PARTY.every((name) => checkedCharacters.includes(name));

    const toggleHolyWar = (event) => {
        setCheckedCharacters(event.currentTarget.checked ? HOLY_WAR_PARTY : DEFAULT_CHARACTERS);
    };

    // Rebuilding the table is the expensive part, and only the game version
    // changes it. Holy War just filters what is already there.
    const manip = useMemo(() => {
        const duration = GAME_VERSIONS.find((v) => v.value === version)?.duration ?? 21.5;
        return createManip({ lastMapDuration: duration });
    }, [version]);

    const results = useMemo(() => {
        if (tilts.length !== MOVEMENTS_SIZE) return null;
        return manip.search(tilts);
    }, [manip, tilts]);

    const handleDPad = useCallback((direction) => {
        setTilts((current) => (current.length < MOVEMENTS_SIZE ? current + TILT_FOR_DIRECTION[direction] : current));
    }, []);

    return (
        <ToolShell
            title="Final Party Manipulation"
            status="working"
            repo="final-party-manip"
            size="md"
            credits={
                <>
                    <Anchor href="http://pingval.g1.xrea.com/">Pingval</Anchor>, <Anchor href="https://twitch.tv/kiitoksia">Kiitoksia</Anchor>{" "}
                    <Anchor href="https://twitch.tv/awesomewaves">awesomeWaves</Anchor>. Thanks to <Anchor href="https://twitch.tv/akimokumi">Akimokumi</Anchor> for help with Ruby,{" "}
                    <Anchor href="https://twitch.tv/thomas_8989">Thomas_8989</Anchor> for testing, and <Anchor href="https://twitch.tv/bodcap">Bodcap</Anchor> for finding the HD JP last map duration.
                </>
            }
        >
            <Stack gap="lg">
                <Grid grow>
                    <Grid.Col span={{ base: 8, sm: 1 }}>
                        <Select label="Game version" value={version} onChange={setVersion} data={GAME_VERSIONS.map((v) => ({ value: v.value, label: v.label }))} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 8, sm: 7 }}>
                        <MultiSelect
                            label="Only show parties containing"
                            value={checkedCharacters}
                            onChange={setCheckedCharacters}
                            data={CHARACTERS.map((name) => ({ value: name, label: CHARACTER_LABELS[name] }))}
                        />
                    </Grid.Col>
                </Grid>

                <Stack style={{ flexGrow: 1 }}>
                    <TextInput
                        label="Inputs"
                        description={
                            <>
                                <Code>W A S D</Code>, <Code>I J K L</Code>, or <Code>8 4 6 2</Code>
                                Anything else (<Code>5</Code>, <Code>*</Code>) is a wildcard.
                            </>
                        }
                        maxLength={MOVEMENTS_SIZE}
                        value={tilts}
                        onChange={(event) => setTilts(event.currentTarget.value)}
                        rightSection={
                            <Text size="xs" c="dimmed">
                                {tilts.length}/{MOVEMENTS_SIZE}
                            </Text>
                        }
                        rightSectionWidth={48}
                        autoFocus
                        autoComplete="off"
                    />
                    <Switch label="Holy War" description="Selphie, Zell, Quistis, and Irvine (the fastest attackers) only." checked={isHolyWar} onChange={toggleHolyWar} />
                </Stack>

                <Center hiddenFrom="sm">
                    <DPad onPress={handleDPad} withWild keys="arrows" />
                </Center>
                <Results results={results} checkedCharacters={checkedCharacters} entered={tilts.length === MOVEMENTS_SIZE} />

                <Accordion variant="contained">
                    <Accordion.Item value="how-to">
                        <Accordion.Control>How to use this tool</Accordion.Control>
                        <Accordion.Panel>
                            <Text size="sm" mb="sm">
                                Starts during the cutscene right after you beat Adel, while the party is falling. Don&apos;t press anything yet, and make sure turbo is off.
                            </Text>
                            <List type="ordered" size="sm" spacing="xs">
                                <List.Item>Write down Squall&apos;s first 12 movements as the party falls - that goes in the Inputs box above.</List.Item>
                                <List.Item>
                                    On the 12th movement, hold a direction and keep holding until the party lands.
                                    <List type="ordered" withPadding size="sm" mt="xs">
                                        <List.Item>
                                            <Badge size="xs" variant="light" color="gray" mr={6}>
                                                Advanced
                                            </Badge>
                                            Let go for the number of movements shown in your result, then hold again. Gets you the right party without drawing later.
                                        </List.Item>
                                    </List>
                                </List.Item>
                                <List.Item>Let go once the party&apos;s feet touch the ground.</List.Item>
                                <List.Item>
                                    If you skipped{" "}
                                    <Badge size="xs" variant="light" color="gray">
                                        Advanced
                                    </Badge>
                                    : Interact with the castle&apos;s draw point (in the clock tower) the number of times shown in your result.
                                </List.Item>
                                <List.Item>Run straight to the final battle and mash confirm at the door.</List.Item>
                            </List>
                        </Accordion.Panel>
                    </Accordion.Item>
                </Accordion>
            </Stack>
        </ToolShell>
    );
}
