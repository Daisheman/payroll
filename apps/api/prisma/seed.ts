import { PrismaClient, ContractType, Currency, EmploymentType, Role } from "@prisma/client";
import * as argon2 from "argon2";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

for (const envPath of [resolve(process.cwd(), ".env"), resolve(process.cwd(), "../../.env")]) {
  if (!existsSync(envPath)) continue;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

const prisma = new PrismaClient();
const DEFAULT_EXCHANGE_RATE = 2600;

const employees = [
  { code:"SGM-N/A", name:"John Ajusa Snr", title:"Project Manager", contractType:"Expert", payType:"FIXED", currency:"USD", usdSalary:8000, hourlyRate:null, stdHours:null, housing:150000, transport:80000, site:150000, startDate:"2026-03-13", nationality:"Zimbabwe" },
  { code:"SGM-001", name:"Sinethemba Ncube", title:"Project Coordinator", contractType:"Expert", payType:"FIXED", currency:"USD", usdSalary:2500, hourlyRate:null, stdHours:null, housing:150000, transport:80000, site:150000, startDate:"2026-03-31", nationality:"Zimbabwe" },
  { code:"SGM-N/A", name:"David Kyser", title:"Engineering Superintendent", contractType:"Expert", payType:"FIXED", currency:"USD", usdSalary:4500, hourlyRate:null, stdHours:null, housing:150000, transport:80000, site:150000, startDate:"2026-03-13", nationality:"Zimbabwe" },
  { code:"SGM-007", name:"Nicholas Mautah", title:"Electrician Class 1", contractType:"Expert", payType:"FIXED", currency:"USD", usdSalary:3300, hourlyRate:null, stdHours:null, housing:150000, transport:80000, site:150000, startDate:"2026-03-31", nationality:"Zimbabwe" },
  { code:"SGM-031", name:"Shingirayi Gombiro", title:"Electrician Class 1", contractType:"Expert", payType:"FIXED", currency:"USD", usdSalary:1650, hourlyRate:null, stdHours:null, housing:150000, transport:80000, site:150000, startDate:"2026-05-01", nationality:"Zimbabwe" },
  { code:"SGM-008", name:"Courage Tembarare", title:"Boiler Maker 1", contractType:"Expert", payType:"FIXED", currency:"USD", usdSalary:1350, hourlyRate:null, stdHours:null, housing:150000, transport:80000, site:150000, startDate:"2026-03-21", nationality:"Zimbabwe" },
  { code:"SGM-026", name:"Roy Vundu", title:"Boiler Maker 4", contractType:"Expert", payType:"FIXED", currency:"USD", usdSalary:1650, hourlyRate:null, stdHours:null, housing:150000, transport:80000, site:150000, startDate:"2026-05-01", nationality:"Zimbabwe" },
  { code:"SGM-033", name:"Darlington Mutinha", title:"Boiler Maker 5", contractType:"Expert", payType:"FIXED", currency:"USD", usdSalary:1650, hourlyRate:null, stdHours:null, housing:150000, transport:80000, site:150000, startDate:"2026-05-17", nationality:"Zimbabwe" },
  { code:"SGM-032", name:"Privilege Mwale", title:"Fitter", contractType:"Expert", payType:"FIXED", currency:"USD", usdSalary:1650, hourlyRate:null, stdHours:null, housing:150000, transport:80000, site:150000, startDate:"2026-05-01", nationality:"Zimbabwe" },
  { code:"SGM-ADM", name:"Administration", title:"Administration", contractType:"Contract", payType:"FIXED", currency:"USD", usdSalary:4000, hourlyRate:null, stdHours:null, housing:150000, transport:80000, site:150000, startDate:"2026-04-01", nationality:"N/A" },
  { code:"SGM-003", name:"Gaspa Simon Mpemba", title:"Builder", contractType:"Citizen", payType:"HOURLY", currency:"TZS", usdSalary:null, hourlyRate:6410.26, stdHours:234, housing:150000, transport:80000, site:150000, startDate:"2026-03-27", nationality:"Tanzania" },
  { code:"SGM-004", name:"Samwel Yotam Deogras", title:"Builder Assistant 1", contractType:"Citizen", payType:"HOURLY", currency:"TZS", usdSalary:null, hourlyRate:3846.15, stdHours:234, housing:null, transport:80000, site:150000, startDate:"2026-04-04", nationality:"Tanzania" },
  { code:"SGM-005", name:"Miraji Athuman Likwawa", title:"Builder Assistant 2", contractType:"Citizen", payType:"HOURLY", currency:"TZS", usdSalary:null, hourlyRate:3846.15, stdHours:234, housing:null, transport:80000, site:150000, startDate:"2026-04-07", nationality:"Tanzania" },
  { code:"SGM-006", name:"Adamu Paulo Silwamba", title:"Builder Assistant 3", contractType:"Citizen", payType:"HOURLY", currency:"TZS", usdSalary:null, hourlyRate:3846.15, stdHours:234, housing:null, transport:80000, site:150000, startDate:"2026-04-14", nationality:"Tanzania" },
  { code:"SGM-010", name:"Fredrick Ndege", title:"Boiler Maker 2", contractType:"Citizen", payType:"HOURLY", currency:"TZS", usdSalary:null, hourlyRate:6410.26, stdHours:234, housing:150000, transport:80000, site:150000, startDate:"2026-04-01", nationality:"Tanzania" },
  { code:"SGM-011", name:"Gervas Charles Idonya", title:"Boiler Maker 3", contractType:"Citizen", payType:"HOURLY", currency:"TZS", usdSalary:null, hourlyRate:6410.26, stdHours:234, housing:150000, transport:80000, site:150000, startDate:"2026-04-04", nationality:"Tanzania" },
  { code:"SGM-012", name:"Robert Biseko", title:"Welder", contractType:"Citizen", payType:"HOURLY", currency:"TZS", usdSalary:null, hourlyRate:5128.21, stdHours:234, housing:null, transport:80000, site:150000, startDate:"2026-04-03", nationality:"Tanzania" },
  { code:"SGM-013", name:"Peter Mashala Mashala", title:"Boiler Maker Asst 2", contractType:"Citizen", payType:"HOURLY", currency:"TZS", usdSalary:null, hourlyRate:3846.15, stdHours:234, housing:null, transport:80000, site:150000, startDate:"2026-04-07", nationality:"Tanzania" },
  { code:"SGM-030", name:"Yohana Onesmo Enosy", title:"Boiler Maker Asst 1", contractType:"Citizen", payType:"HOURLY", currency:"TZS", usdSalary:null, hourlyRate:3846.15, stdHours:234, housing:null, transport:80000, site:150000, startDate:"2026-05-11", nationality:"Tanzania" },
  { code:"SGM-015", name:"Makoye John", title:"General Worker 1", contractType:"Citizen", payType:"HOURLY", currency:"TZS", usdSalary:null, hourlyRate:2649.57, stdHours:234, housing:null, transport:80000, site:150000, startDate:"2026-04-10", nationality:"Tanzania" },
  { code:"SGM-016", name:"Ebeneza Poul", title:"General Worker 2", contractType:"Citizen", payType:"HOURLY", currency:"TZS", usdSalary:null, hourlyRate:2649.57, stdHours:234, housing:null, transport:80000, site:150000, startDate:"2026-04-10", nationality:"Tanzania" },
  { code:"SGM-017", name:"Elikana Simon Kasala", title:"General Worker 3", contractType:"Citizen", payType:"HOURLY", currency:"TZS", usdSalary:null, hourlyRate:2649.57, stdHours:234, housing:null, transport:80000, site:150000, startDate:"2026-04-03", nationality:"Tanzania" },
  { code:"SGM-018", name:"Simeo Brandy Katwiga", title:"General Worker 4", contractType:"Citizen", payType:"HOURLY", currency:"TZS", usdSalary:null, hourlyRate:2649.57, stdHours:234, housing:null, transport:80000, site:150000, startDate:"2026-04-03", nationality:"Tanzania" },
  { code:"SGM-019", name:"Joshua Kessy", title:"General Worker 5", contractType:"Citizen", payType:"HOURLY", currency:"TZS", usdSalary:null, hourlyRate:2649.57, stdHours:234, housing:null, transport:80000, site:150000, startDate:"2026-04-03", nationality:"Tanzania" },
  { code:"SGM-020", name:"Kelvin Pendel Salakike", title:"General Worker 6", contractType:"Citizen", payType:"HOURLY", currency:"TZS", usdSalary:null, hourlyRate:2649.57, stdHours:234, housing:null, transport:80000, site:150000, startDate:"2026-04-10", nationality:"Tanzania" },
  { code:"SGM-021", name:"Fredrick Malaki", title:"General Worker 7", contractType:"Citizen", payType:"HOURLY", currency:"TZS", usdSalary:null, hourlyRate:2649.57, stdHours:234, housing:null, transport:80000, site:150000, startDate:"2026-04-10", nationality:"Tanzania" },
  { code:"SGM-022", name:"Benjamin Wilium Aron", title:"General Worker 8", contractType:"Citizen", payType:"HOURLY", currency:"TZS", usdSalary:null, hourlyRate:2649.57, stdHours:234, housing:null, transport:80000, site:150000, startDate:"2026-04-12", nationality:"Tanzania" },
  { code:"SGM-023", name:"Yohana Gubi", title:"General Worker 9", contractType:"Citizen", payType:"HOURLY", currency:"TZS", usdSalary:null, hourlyRate:2649.57, stdHours:234, housing:null, transport:80000, site:150000, startDate:"2026-04-14", nationality:"Tanzania" },
  { code:"SGM-024", name:"Leison Loshi Lazer", title:"General Worker 10", contractType:"Citizen", payType:"HOURLY", currency:"TZS", usdSalary:null, hourlyRate:2649.57, stdHours:234, housing:null, transport:80000, site:150000, startDate:"2026-04-14", nationality:"Tanzania" },
  { code:"SGM-025", name:"Isaki Bariki Mbaya", title:"General Worker 11", contractType:"Citizen", payType:"HOURLY", currency:"TZS", usdSalary:null, hourlyRate:2649.57, stdHours:234, housing:null, transport:80000, site:150000, startDate:"2026-04-19", nationality:"Tanzania" },
  { code:"SGM-027", name:"Emmanuel Lazano", title:"General Worker 12", contractType:"Citizen", payType:"HOURLY", currency:"TZS", usdSalary:null, hourlyRate:2649.57, stdHours:234, housing:null, transport:80000, site:150000, startDate:"2026-05-11", nationality:"Tanzania" },
  { code:"SGM-028", name:"Godfrey Lugembe", title:"General Worker 13", contractType:"Citizen", payType:"HOURLY", currency:"TZS", usdSalary:null, hourlyRate:2649.57, stdHours:234, housing:null, transport:80000, site:150000, startDate:"2026-05-11", nationality:"Tanzania" },
  { code:"SGM-029", name:"Boaz Shimeji", title:"General Worker 14", contractType:"Citizen", payType:"HOURLY", currency:"TZS", usdSalary:null, hourlyRate:2649.57, stdHours:234, housing:null, transport:80000, site:150000, startDate:"2026-05-11", nationality:"Tanzania" },
];

function names(fullName: string) {
  const [firstName, ...rest] = fullName.split(" ");
  return { firstName, lastName: rest.join(" ") || firstName };
}

async function main() {
  await prisma.company.deleteMany({ where: { slug: { in: ["demo", "7d-minerals-sa"] } } });

  const company = await prisma.company.create({
    data: {
      name: "7D Minerals (SA)",
      slug: "7d-minerals-sa",
      registration: "7DM-SA-2025",
      country: "TZ",
      taxYear: "2025/26",
      contract: "Sogomi Management Contract",
      nssfReg: "NSSF-7DM-001",
      wcfReg: "WCF-7DM-001",
      settings: { create: { payrollCutoffDay: 25, enableMfa: false } },
    },
  });

  await prisma.user.create({
    data: {
      companyId: company.id,
      name: "Profacc Admin",
      email: "admin@profacc.co.bw",
      passwordHash: await argon2.hash("Profacc2025#"),
      roles: [Role.OWNER, Role.ADMIN, Role.PAYROLL_MANAGER, Role.HR_MANAGER],
    },
  });

  for (const employee of employees) {
    const split = names(employee.name);
    const baseSalary = employee.currency === "USD" ? (employee.usdSalary ?? 0) * DEFAULT_EXCHANGE_RATE : 0;
    const created = await prisma.employee.create({
      data: {
        companyId: company.id,
        employeeNumber: employee.code,
        fullName: employee.name,
        firstName: split.firstName,
        lastName: split.lastName,
        title: employee.title,
        contractType: employee.contractType as ContractType,
        employmentType: employee.payType as EmploymentType,
        currency: employee.currency as Currency,
        usdSalary: employee.usdSalary,
        baseSalary,
        hourlyRate: employee.hourlyRate,
        stdHoursPerMonth: employee.stdHours,
        housingAllowance: employee.housing,
        transportAllowance: employee.transport,
        siteAllowance: employee.site,
        startDate: new Date(employee.startDate),
        nationality: employee.nationality,
      },
    });
    await prisma.salaryHistory.create({
      data: {
        companyId: company.id,
        employeeId: created.id,
        effectiveDate: new Date(employee.startDate),
        payType: employee.payType as EmploymentType,
        fixedSalaryTzs: employee.currency === "TZS" && employee.payType === "FIXED" ? baseSalary : null,
        hourlyRateTzs: employee.hourlyRate,
        stdHoursPerMonth: employee.stdHours,
        currency: employee.currency as Currency,
        usdSalary: employee.usdSalary,
        exchangeRate: employee.currency === "USD" ? DEFAULT_EXCHANGE_RATE : null,
        housingAllowance: employee.housing,
        transportAllow: employee.transport,
        siteAllowance: employee.site,
        reason: "Initial Profacc seed",
        createdBy: "seed",
      },
    });
  }
}

main().finally(async () => prisma.$disconnect());
