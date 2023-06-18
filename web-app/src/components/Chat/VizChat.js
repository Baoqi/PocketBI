import { useEffect, useRef } from "react";
import { HandThumbDownIcon, HandThumbUpIcon, TrashIcon, UserIcon } from "@heroicons/react/20/solid";
import { CpuChipIcon } from "@heroicons/react/24/outline";
import Table from "../table/Table";
import {translateToGraphicWalkerFields} from "../../api/GraphicWalkerUtil";
import GraphicWalkerChartViewer from "../GraphicWalker/GraphicWalkerChartViewer";
import AceEditor from "react-ace";
import {Tabs} from "antd";

const visSpecTemplate =
    {
        "config": {
            "defaultAggregated": false,
            "format": {
            },
            "geoms": [
                "auto"
            ],
            "interactiveScale": false,
            "showActions": false,
            "size": {
                "height": 300,
                "mode": "auto",
                "width": 600
            },
            "sorted": "none",
            "stack": "stack"
        },
        "encodings": {
            "color": [],
            "columns": [],
            "details": [],
            "dimensions": [],
            "filters": [],
            "measures": [],
            "opacity": [],
            "radius": [],
            "rows": [],
            "shape": [],
            "size": [],
            "text": [],
            "theta": []
        },
        "name": "Chart 1",
        "visId": "gw_JZsS"
    };

function getVizList(queryResultData, fields, vizColumns) {
    if (!queryResultData || !fields || !vizColumns) {
        return [visSpecTemplate];
    }

    // deep copy visSpecTemplate
    let template = JSON.parse(JSON.stringify(visSpecTemplate));

    let dimensions = [];
    let measures = [];

    for (let i = 0; i < fields?.length; i++) {
        const field = fields[i];
        if (field?.semanticType === "quantitative") {
            measures.push(field);
        } else {
            dimensions.push(field);
        }
    }

    for (let i = 0; i < vizColumns?.length; i++) {
        let vizColumn = vizColumns[i];
        // find vizColumn.name in fields
        let field = fields.find(field => field.name === vizColumn.name);
        if (field) {
            let zones = vizColumn?.zone || [];
            for (let j = 0; j < zones.length; j++) {
                switch (zones[j]) {
                    case "x":
                        template.encodings.columns.push(field);
                        break;
                    case "y":
                        template.encodings.rows.push(field);
                        break;
                    case "color":
                        template.encodings.color.push(field);
                        break;
                    case "opacity":
                        template.encodings.opacity.push(field);
                        break;
                    case "size":
                        template.encodings.size.push(field);
                        break;
                    case "shape":
                        template.encodings.shape.push(field);
                        break;
                    case "row":
                        template.encodings.rows.push(field);
                        break;
                    case "column":
                        template.encodings.columns.push(field);
                        break;
                    case "detail":
                        template.encodings.details.push(field);
                        break;
                }
            }
        }
    }

    template.encodings.dimensions = dimensions;
    template.encodings.measures = measures;
    console.log('generated viz template is: ', template);
    return [
        template
    ]
}

function VizChat({ messages, dataset, onDelete, onUserFeedback }) {
    const container = useRef(null);
    useEffect(() => {
        if (container.current) {
            container.current.scrollTop = container.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="border-2 border-zinc-100 dark:border-zinc-800 overflow-y-auto" ref={container} style={{ maxHeight: "80vh" }}>
            {messages.map((message, index) => {
                if (message.role === "assistant") {
                    const queryResultColumns = message.content.result?.columns;
                    const queryResultData = message.content.result?.data;

                    if (!message.content.error) {
                        let fields = translateToGraphicWalkerFields(queryResultColumns, queryResultData);
                        return (
                            <div className="p-4 flex justify-top" key={index}>
                                <div className="grow-0">
                                    <div className="inline-block h-10 w-10 rounded-full mx-4 bg-indigo-500 text-white flex items-center justify-center">
                                        <CpuChipIcon className="w-6" />
                                    </div>
                                </div>
                                <div className="grow pl-8">
                                    <Tabs
                                        tabPosition={'top'}
                                        centered={true}
                                        items={[
                                            {
                                                label: 'Chart',
                                                key: 'chart',
                                                children: (
                                                    <GraphicWalkerChartViewer
                                                        dataSource={queryResultData}
                                                        rawFields={fields}
                                                        visSpecList={getVizList(queryResultData, fields, message.content.columns)}
                                                    ></GraphicWalkerChartViewer>
                                                )
                                            },
                                            {
                                                label: 'Table',
                                                key: 'table',
                                                children: (
                                                    <Table
                                                        data={queryResultData}
                                                        columns={queryResultColumns}
                                                        defaultPageSize={10}
                                                        showPagination={true}
                                                        height={'200'}
                                                    />
                                                )
                                            },
                                            {
                                                label: 'SQL',
                                                key: 'sql',
                                                children: (
                                                    <AceEditor
                                                        value={message.content.sql}
                                                        mode="mysql"
                                                        theme="xcode"
                                                        name="sqlQuery"
                                                        readOnly={true}
                                                        wrapEnabled={true}
                                                        highlightActiveLine={false}
                                                        width={'100%'}
                                                        minLines={5}
                                                        maxLines={200}
                                                        fontSize={15}
                                                        showPrintMargin={false}
                                                        showGutter={true}
                                                        setOptions={{
                                                            showLineNumbers: true,
                                                            tabSize: 2
                                                        }}
                                                    />
                                                )
                                            }
                                        ]}
                                    />
                                </div>
                                <div className="float-right flex gap-4 items-start">
                                    <HandThumbUpIcon
                                        className="w-4 text-gray-500 dark:text-gray-300 cursor-pointer hover:scale-125"
                                        onClick={() => {
                                            onUserFeedback &&
                                            onUserFeedback([messages[index - 1], message], index, "like");
                                        }}
                                    />
                                    <HandThumbDownIcon
                                        className="w-4 text-gray-500 dark:text-gray-300 cursor-pointer hover:scale-125"
                                        onClick={() => {
                                            onUserFeedback &&
                                            onUserFeedback([messages[index - 1], message], index, "dislike");
                                        }}
                                    />
                                    <TrashIcon
                                        className="w-4 text-gray-500 dark:text-gray-300 cursor-pointer hover:scale-125"
                                        onClick={() => {
                                            onDelete && onDelete(message, index);
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    } else {
                        return (
                            <div className="p-4 flex justify-top" key={index}>
                                <div className="grow-0">
                                    <div className="inline-block h-10 w-10 rounded-full mx-4 bg-indigo-500 text-white flex items-center justify-center">
                                        <CpuChipIcon className="w-6" />
                                    </div>
                                </div>
                                <div className="grow pl-8 overflow-x-auto">
                                    <p>{message.content.error}</p>
                                </div>
                            </div>
                        );
                    }
                }
                return (
                    <div className="p-4 bg-zinc-100 dark:bg-zinc-800 flex" key={index}>
                        <div className="grow-0">
                            <div className="inline-block h-10 w-10 rounded-full mx-4 bg-green-500 text-white flex items-center justify-center">
                                <UserIcon className="w-6" />
                            </div>
                        </div>
                        <div className="grow pl-8">
                            <p>{message.content}</p>
                        </div>
                        <div className="float-right">
                            <TrashIcon
                                className="w-4 text-gray-500 dark:text-gray-300 cursor-pointer hover:scale-125"
                                onClick={() => {
                                    onDelete && onDelete(message, index);
                                }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default VizChat;
