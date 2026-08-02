import { memo } from "react";
import PropTypes from "prop-types";
import { Code, Flex, Group, Text, Stack } from "@mantine/core";
import TargetCard from "./TargetCard";

// Only draw counts this low are worth acting on in a run.
const MAX_USEFUL_OFFSET = 20;

const DIRECTION_ARROWS = { 8: "↑", 2: "↓", 4: "←", 6: "→" };
const toArrows = (movements) => [...movements].map((c) => DIRECTION_ARROWS[c] ?? c).join("");

// A memoized card per result, so scrolling (which only changes WHICH results
// are mounted, not their content) doesn't re-render cards whose data hasn't
// changed. `checkedCharacters`/`result` are read fresh each render regardless,
// since they're stable references.
const ResultCard = memo(function ResultCard({ result, checkedCharacters, virtualIndex, start, measureElement }) {
    const offsets = [...result.targetOffsets]
        .sort((a, b) => a.offset - b.offset)
        .filter((entry) => entry.offset <= MAX_USEFUL_OFFSET)
        .filter((entry) => entry.party.every((name) => checkedCharacters.includes(name)));

    return (
        <div
            ref={measureElement}
            data-index={virtualIndex}
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${start}px)`,
                paddingBottom: "var(--mantine-spacing-xs)",
            }}
        >
            <Flex
                direction={{ base: "column", sm: "row" }}
                align={{ base: "stretch", sm: "center" }}
                gap="sm"
                style={{
                    border: "1px solid var(--mantine-color-default-border)",
                    borderRadius: "var(--mantine-radius-sm)",
                    padding: "var(--mantine-spacing-xs) var(--mantine-spacing-sm)",
                }}
            >
                <Stack align="center" justify="center" gap={6} style={{ flexShrink: 0 }}>
                    <Text fw={600}>ID {result.index}</Text>
                    <Code color="blue.9" c="white" style={{ letterSpacing: "0.15em" }} fw={600}>
                        {toArrows(result.movements)}
                    </Code>
                </Stack>
                <Group gap={6} wrap="wrap">
                    {offsets.length === 0 && (
                        <Text size="sm" c="dimmed">
                            No party within {MAX_USEFUL_OFFSET} draws.
                        </Text>
                    )}
                    {offsets.map((entry) => (
                        <TargetCard key={entry.party.join("-")} party={entry.party} offset={entry.offset} />
                    ))}
                </Group>
            </Flex>
        </div>
    );
});

ResultCard.propTypes = {
    result: PropTypes.object.isRequired,
    checkedCharacters: PropTypes.arrayOf(PropTypes.string).isRequired,
    virtualIndex: PropTypes.number.isRequired,
    start: PropTypes.number.isRequired,
    measureElement: PropTypes.func.isRequired,
};

export default ResultCard;
