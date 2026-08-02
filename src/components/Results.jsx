import { useRef } from "react";
import PropTypes from "prop-types";
import { Badge, Center, Text } from "@mantine/core";
import { useVirtualizer } from "@tanstack/react-virtual";
import { MOVEMENTS_SIZE } from "../lib/manip";
import ResultCard from "./ResultCard";

export default function Results({ results, checkedCharacters, entered }) {
    const scrollRef = useRef(null);

    // A pattern with many wildcards can match thousands of rows, and each one
    // renders as its own bordered table. Mounting all of them at once is what
    // made this slow.  the actual RNG search itself is sub-millisecond regardless
    // of pattern. Virtualizing means only the handful of cards actually on screen
    // ever exist as real DOM nodes, so cost stays flat no matter how many rows
    // match.
    const virtualizer = useVirtualizer({
        count: results?.length ?? 0,
        getScrollElement: () => scrollRef.current,
        estimateSize: () => 60,
        overscan: 6,
        getItemKey: (i) => results[i].index,
    });

    if (!entered) {
        return (
            <Text c="dimmed" ta="center">
                Enter all {MOVEMENTS_SIZE} movements to see results.
            </Text>
        );
    }

    if (!results || results.length === 0) {
        return (
            <Center>
                <Badge color="red" size="lg">
                    No match found
                </Badge>
            </Center>
        );
    }

    return (
        <div ref={scrollRef} style={{ height: 520, overflow: "auto" }}>
            <div style={{ position: "relative", height: virtualizer.getTotalSize() }}>
                {virtualizer.getVirtualItems().map((virtualRow) => (
                    <ResultCard
                        key={virtualRow.key}
                        result={results[virtualRow.index]}
                        checkedCharacters={checkedCharacters}
                        virtualIndex={virtualRow.index}
                        start={virtualRow.start}
                        measureElement={virtualizer.measureElement}
                    />
                ))}
            </div>
        </div>
    );
}

Results.propTypes = {
    results: PropTypes.arrayOf(PropTypes.object),
    checkedCharacters: PropTypes.arrayOf(PropTypes.string).isRequired,
    entered: PropTypes.bool,
};
