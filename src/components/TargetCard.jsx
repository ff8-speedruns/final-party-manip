import { memo } from "react";
import PropTypes from "prop-types";
import { Group, Paper, Stack, Text } from "@mantine/core";
import { toDisplayParty } from "../lib/display";

const TargetCard = memo(function TargetCard({ party, offset }) {
    return (
        <Paper
            radius="md"
            shadow="sm"
            py={12}
            px={16}
            style={{
                background: "linear-gradient(-60deg, var(--mantine-color-blue-4) 0%, var(--mantine-color-blue-7) 100%)",
            }}
        >
            <Group gap={16} wrap="nowrap" align="center">
                <Stack gap={0} align="center" style={{ flexShrink: 0, width: 50 }}>
                    <Text c="white" fw={700} fz={30} lh={1.2}>
                        +{offset}
                    </Text>
                    <Text c="blue.1" fz={10} lh={1.2} tt="uppercase">
                        Draws
                    </Text>
                </Stack>
                <Text c="white" fw={600} fz="sm" style={{ whiteSpace: "pre-line", width: 100, flexShrink: 0 }}>
                    {toDisplayParty(party)}
                </Text>
            </Group>
        </Paper>
    );
});

TargetCard.propTypes = {
    party: PropTypes.arrayOf(PropTypes.string).isRequired,
    offset: PropTypes.number.isRequired,
};

export default TargetCard;
