var count=0;
var DIALOGUES = {
girl:{
	"actors": [
		{
			"id": 1,
			"name": "Emily",
			"invisible": 0
		},
		{
			"id": 2,
			"name": "John",
			"invisible": 0
		}
	],
	"dialogues": [
		{
			"id": 1,
			"isChoice": false,
			"actor": 2,
			"conversant": 1,
			"menuText": "",
			"dialogueText": "hi",
			"conditionsString": "",
			"codeBefore": "",
			"codeAfter": "",
			"outgoingLinks": [
				2
			],
			"parent": ""
		},
		{
			"id": 2,
			"parent": 1,
			"isChoice": true,
			"conditionsString": "",
			"codeBefore": "",
			"codeAfter": "",
			"outgoingLinks": [
				3,
				4
			]
		},
		{
			"id": 3,
			"isChoice": false,
			"actor": 1,
			"conversant": 2,
			"menuText": "say hello",
			"dialogueText": "hi back",
			"conditionsString": "",
			"codeBefore": "",
			"codeAfter": "",
			"outgoingLinks": [],
			"parent": 2
		},
		{
			"id": 4,
			"isChoice": false,
			"actor": 1,
			"conversant": 2,
			"menuText": "Curse them",
			"dialogueText": "Fuck off",
			"conditionsString": "",
			"codeBefore": "if(count==2)alert('fuck you'); count++;",
			"codeAfter": "",
			"outgoingLinks": [],
			"parent": 2
		}
	]
}
};