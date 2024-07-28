import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Function, Runtime, Code } from "aws-cdk-lib/aws-lambda";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { Table, AttributeType } from "aws-cdk-lib/aws-dynamodb";

const path = require("path");

export class ProjectCdkStack extends cdk.Stack {
  public readonly backendFunction: Function;
  public readonly restApi: LambdaRestApi;
  public readonly productDetailsTable: Table;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.backendFunction = new Function(this, "BackendFunction", {
      runtime: Runtime.PYTHON_3_12,
      handler: "index.handler",
      code: Code.fromAsset(path.join(__dirname, "../../Project-backend")),
    });

    this.restApi = new LambdaRestApi(this, "restAPI", {
      handler: this.backendFunction,
      proxy: false,
    });

    const postProductDetailsResource = this.restApi.root.addResource(
      "post_product_details"
    );
    postProductDetailsResource.addMethod("POST");

    const getProductDetailsResource = this.restApi.root.addResource(
      "get_product_details"
    );
    getProductDetailsResource.addMethod("GET");

    this.productDetailsTable = new Table(this, "ProductDetailsTable", {
      tableName: "Product_Details_Table",
      partitionKey: {
        name: "product_id",
        type: AttributeType.STRING,
      },
    });

    this.productDetailsTable.grantReadWriteData(this.backendFunction);
  }
}
