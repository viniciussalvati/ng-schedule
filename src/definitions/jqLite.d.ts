interface JQueryStatic {
	(selector: string | Element): JQuery;
}

type JQueryElement = string | Element | JQuery;

interface JQuery {
	[index: number]: Element;

	addClass(classes: string): JQuery;
	removeClass(classes: string): JQuery;

	data(data: any): JQuery;
	data(): any;

	parent(): JQuery;

	remove(): JQuery;
	append(element: JQueryElement): JQuery;
}